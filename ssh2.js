var SSHClient = require('ssh2').Client
var events = require('events');
const { join, parse } = require('path');

class MySSHClient {
    constructor() {
        this.client = undefined;
        this.firstClient = undefined;
        this.sftp = undefined;
        this.eventEmitter = new events.EventEmitter();
    }

    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    removeListener(event, callback) {
        this.eventEmitter.removeListener(event, callback);
    }

    _sshConnectDirect(host, stream) {
        let _eventEmmitter = this.eventEmitter;
        return new Promise((resolve, reject) => {
            let client = new SSHClient();
            console.log('connecting:', host.ip)
            if (!host.child) {
                client.on('banner', (data) => {
                    _eventEmmitter.emit('ssh-data', data.replace(/\r?\n/g, '\r\n').toString('utf-8'))
                })
            }
            client.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => { finish[host.pass] })
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
                    keepaliveInterval: 1000
                })
            } else {
                this.firstClient = client;
                client.connect({
                    host: host.ip,
                    port: host.port || 22,
                    username: host.user,
                    password: host.pass,
                    keepaliveInterval: 1000
                })
            }
        })
    }
    async _sshConnect(host, stream) {
        let stream2 = await this._sshConnectDirect(host, stream);
        if (!host.child) {
            return stream2;
        }
        return this._sshConnect(host.child, stream2);
    }
    sftpConnect(config) {
        return new Promise((resolve, reject) => {
            this._sshConnect(config).then((client) => {
                this.client = client;
                this.client.sftp((err, sftp) => {
                    if (err) {
                        //reject(new Error('SFTP Connect Error'));
                        reject(err)
                    } else {
                        this.sftp = sftp;
                        resolve();
                    }
                })
            })
        })
    }
    end() {
        this.firstClient.end();
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
    _realPath(remotePath) {
        return new Promise((resolve, reject) => {
            if (!this.sftp) reject(new Error('No Connection'));
            this.sftp.realpath(remotePath, (err, absPath) => {
                if (err) {
                    if (err.code === 2) {
                        resolve('');
                    } else {
                        reject(err);
                    }
                }
                resolve(absPath);
            });
        });
    }
    cwd() {
        return this._realPath('./');
    }
    async exists(remotePath) {
        try {
            if (!this.sftp) reject(new Error('No Connection'));
            if (remotePath === '.') {
                return 'd';
            }
            let absPath = await utils.normalizeRemotePath(this, remotePath);
            try {
                this.debugMsg(`exists -> ${absPath}`);
                let info = await this.stat(absPath);
                this.debugMsg('exists <- ', info);
                if (info.isDirectory) {
                    return 'd';
                }
                if (info.isSymbolicLink) {
                    return 'l';
                }
                if (info.isFile) {
                    return '-';
                }
                return false;
            } catch (err) {
                if (err.code === errorCode.notexist) {
                    return false;
                }
                throw err;
            }
        } catch (err) {
            return utils.handleError(err, 'exists');
        }
    }
    async mkdir(remotePath, recursive = false) {
        const _mkdir = (p) => {
            return new Promise((resolve, reject) => {
                this.sftp.mkdir(p, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(`${p} directory created`);
                });
            });
        };

        try {
            if (!this.sftp) reject(new Error('No Connection'));
            if (!recursive) {
                return _mkdir(remotePath);
            }
            let dir = parse(remotePath).dir;
            if (dir) {
                let dirExists = await this.exists(dir);
                if (!dirExists) {
                    await this.mkdir(dir, true);
                }
            }
            return _mkdir(remotePath);
        } catch (err) {
            return utils.handleError(`${err.message} ${remotePath}`, 'mkdir');
        }
    }
    async download(remotePath, fileList, localPath) {

    }
}
client1 = new MySSHClient()

client1.sftpConnect({
    ip: '192.168.3.135',
    user: 'ubuntu',
    pass: 'vonf99'
}).then(() => {
    client1.sftpListDir('/').then((list) => {
        console.log(list)
        console.log('---------------------------------------')
        client1.end();
    })
})

client2 = new MySSHClient()
client2.sftpConnect({
    ip: '192.168.3.135',
    user: 'ubuntu',
    pass: 'vonf99',
    child: {
        ip: '172.17.0.1',
        user: 'ubuntu',
        pass: 'vonf99',
    }
}).then(() => {
    client2.cwd().then((path) => {
        console.log(path);
        client2.sftpListDir(path).then((list) => {
            console.log(list)
            console.log('=======================================')
            client2.end();
        })
    })

})