var SSHClient = require('ssh2').Client
var SFTPClient = require('ssh2-sftp-client');
var utils = require('ssh2-sftp-client/src/utils');
var fs = require('fs');
var path = require('path');
var events = require('events');
var net = require("net");

class MySSHClient extends SFTPClient {
    constructor() {
        super();
        this.firstClient = undefined;
        this.server = undefined;
        this.eventEmitter = new events.EventEmitter();
    }
    on(eventType, callback) {
        if (eventType === 'progress') this.eventEmitter.on('progress', callback);
        else this.client.on(eventType, callback);
    }
    _sshConnectDirect(host, stream) {
        let _eventEmmitter = this.eventEmitter;
        let client = this.client;
        return new Promise((resolve, reject) => {
            console.log('connecting:', host.ip)
            if (!host.child) {
                client.on('banner', (data) => {
                    console.log('banner:', data);
                    _eventEmmitter.emit('ssh-data', data.replace(/\r?\n/g, '\r\n').toString('utf-8'))
                })
            } else {
                client = new SSHClient();
            }
            client.removeAllListeners('error');
            client.on('error', err => reject(err));
            client.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => { finish([host.pass]) })
                .on('ready', () => {
                    console.log('connected:', host.ip)
                    if (host.child) {
                        client.forwardOut('127.0.0.1', 0, host.child.ip, 22, (err, stream) => {
                            resolve(stream);
                        })
                    } else {
                        resolve(client);
                    }
                })
            if (stream) {
                client.connect({
                    sock: stream,
                    username: host.user,
                    password: host.pass,
                    tryKeyboard: true,
                    keepaliveInterval: 1000
                })
            } else {
                this.firstClient = client;
                client.connect({
                    host: host.ip,
                    port: host.port || 22,
                    username: host.user,
                    password: host.pass,
                    tryKeyboard: true,
                    keepaliveInterval: 1000
                })
            }
        })
    }
    async _sshConnect(host, stream) {
        let stream2 = await this._sshConnectDirect(host, stream);
        if (!host.child || host.child.forward) {
            return host.child;
        }
        return this._sshConnect(host.child, stream2);
    }
    async listRemoteTree(localPath, remotePath) {
        let fileList = [];
        let allList = await this.list(remotePath);

        for (let f of allList) {
            if (f.type === 'd') {
                let subLocalPath = localPath + this.remotePathSep + f.name;
                let subRemotePath = remotePath + this.remotePathSep + f.name;
                let subFileList = await this.listRemoteTree(subLocalPath, subRemotePath);
                for (let f1 of subFileList) fileList.push(f1);
            } else if (f.type === '-') {
                fileList.push({ localPath: localPath, remotePath: remotePath, name: f.name, size: f.size });
            }
        }
        return fileList;
    }
    listLocalTree(localPath, remotePath) {
        let fileList = [];
        let allList = fs.readdirSync(localPath, { withFileTypes: true });

        for (let f of allList) {
            if (f.isDirectory()) {
                let subLocalPath = localPath + this.remotePathSep + f.name;
                let subRemotePath = remotePath + this.remotePathSep + f.name;
                let subFileList = this.listLocalTree(subLocalPath, subRemotePath);
                for (let f1 of subFileList) fileList.push(f1);
            } else if (f.isFile()) {
                let stat = fs.statSync(path.join(localPath, f.name));
                fileList.push({ localPath: localPath, remotePath: remotePath, name: f.name, size: stat.size });
            }
        }

        return fileList;
    }
    sftpConnect(config) {
        return new Promise((resolve, reject) => {
            this._sshConnect(config).then(() => {
                this.client.sftp((err, sftp) => {
                    if (err) {
                        //reject(new Error('SFTP Connect Error'));
                        reject(err)
                    } else {
                        this.sftp = sftp;
                        resolve();
                    }
                })
            }).catch((err) => {
                reject(err);
            })
        })
    }
    sshConnect(config) {
        return new Promise((resolve, reject) => {
            this._sshConnect(config).then(() => {
                this.client.shell({ term: 'xterm-color' }, (err, stream) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(stream);
                    }
                })
            }).catch((err) => {
                reject(err);
            })
        })
    }
    forwardConnect(config) {
        return new Promise((resolve, reject) => {
            this._sshConnect(config).then((host) => {
                if (!host) { reject("invaild host") }
                this.server = net.createServer((socket) => {
                    this.client.forwardOut(socket.remoteAddress, socket.remotePort, host.ip, host.port, (err, stream) => {
                        if (err) {
                            socket.destroy();
                            reject(err);
                        }
                        if (stream) {
                            stream.pipe(socket);
                            socket.pipe(stream);
                            stream.on('close', () => socket.destroy())
                            socket.on('close', () => stream.close())
                        }
                    })
                })
                this.server.listen(host.localPort, '0.0.0.0');
                resolve();
            }).catch((err) => {
                reject(err);
            })
        })
    }
    end() {
        if (this.server)
            this.server.close();
        if (this.firstClient)
            this.firstClient.end();
        else
            super.end();
    }
    sftpListDir(dir) {
        return new Promise((resolve, reject) => {
            if (!this.sftp) {
                reject(new Error('No Connection'));
            }
            this.sftp.readdir(dir, (err, fileList) => {
                if (err) reject(err);
                else if (fileList) {
                    let newList = fileList.map((item) => {
                        return {
                            type: item.longname.substr(0, 1),
                            name: item.filename,
                            size: item.attrs.size,
                            time: item.attrs.mtime * 1000
                        }
                    })
                    resolve(newList);
                }
            })
        })
    }
    async sftpDownload(localPath, remotePath, downloadList) {
        let fileList = []
        let totalSize = 0,
            totalTrans = 0;
        for (let item of downloadList) {
            if (item.type === '-') {
                let name = remotePath + this.remotePathSep + item.name;
                let stat = await this.stat(name);
                fileList.push({ localPath: localPath, remotePath: remotePath, name: item.name, size: stat.size });
                totalSize += stat.size;
            } else if (item.type === 'd') {
                let subLocalPath = localPath + this.remotePathSep + item.name;
                let subRemotePath = remotePath + this.remotePathSep + item.name;
                let subFileList = await this.listRemoteTree(subLocalPath, subRemotePath);
                for (let f of subFileList) {
                    fileList.push(f);
                    totalSize += f.size;
                }
            }
        }
        for (let item of fileList) {
            let status = await utils.localExists(item.localPath);
            if (!status) {
                fs.mkdirSync(item.localPath, { recursive: true });
            }
            let src = item.remotePath + this.remotePathSep + item.name;
            let dst = item.localPath + this.remotePathSep + item.name;
            await this.fastGet(src, dst, {
                chunkSize: 1048576,
                step: (transed, chunck, total) => {
                    this.eventEmitter.emit('progress', { file: src, fileSize: item.size, fileTrans: transed, totalSize: totalSize, totalTrans: totalTrans + transed });
                }
            })
            totalTrans += item.size;
            this.eventEmitter.emit('progress', { file: src, fileSize: item.size, fileTrans: item.size, totalSize: totalSize, totalTrans: totalTrans });
        }
        return 'success';
    }
    async sftpUpload(localPath, remotePath, uploadList) {
        let fileList = []
        let totalSize = 0,
            totalTrans = 0;
        for (let item of uploadList) {
            if (item.type === '-') {
                let name = localPath + this.remotePathSep + item.name;
                let stat = fs.statSync(name);
                fileList.push({ localPath: localPath, remotePath: remotePath, name: item.name, size: stat.size });
                totalSize += stat.size;
            } else if (item.type === 'd') {
                let subLocalPath = localPath + this.remotePathSep + item.name;
                let subRemotePath = remotePath + this.remotePathSep + item.name;
                let subFileList = this.listLocalTree(subLocalPath, subRemotePath);
                for (let f of subFileList) {
                    fileList.push(f);
                    totalSize += f.size;
                }
            }
        }
        console.log("filelist:", fileList)
        for (let item of fileList) {
            let status = await this.exists(item.remotePath);
            if (!status) {
                await this.mkdir(item.remotePath, { recursive: true });
            }
            let dst = item.remotePath + this.remotePathSep + item.name;
            let src = item.localPath + this.remotePathSep + item.name;
            await this.fastPut(src, dst, {
                chunkSize: 1048576,
                step: (transed, chunck, total) => {
                    this.eventEmitter.emit('progress', { file: src, fileSize: item.size, fileTrans: transed, totalSize: totalSize, totalTrans: totalTrans + transed });
                }
            })
            totalTrans += item.size;
            this.eventEmitter.emit('progress', { file: src, fileSize: item.size, fileTrans: item.size, totalSize: totalSize, totalTrans: totalTrans });
        }
        return 'success';
    }
}

module.exports = MySSHClient;