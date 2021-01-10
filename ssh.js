var MySSHClient = require('./myssh');

function sshConnectDirect(socket, host, type) {
    console.log("ssh connect:" + JSON.stringify(host));
    var sshconn = new SSHClient();
    sshconn.on('banner', function(data) {
        socket.emit('ssh-data', data.replace(/\r?\n/g, '\r\n').toString('utf-8'))
    })
    sshconn.on('ready', function() {
        console.log("ssh connected:" + JSON.stringify(host));
        //保存ssh连接信息到socket
        socket.sshconn = sshconn;
        socket.emit('ssh-conn-ack');
        //如果为ssh，直接打开shell
        if (type == 'ssh') {
            sshconn.shell({ term: 'xterm-color' }, function(err, stream) {
                if (err) {
                    sshError('Exec error:' + err);
                    sshconn.end();
                    return;
                }
                socket.on('ssh-data', function(data) { stream.write(data); });
                socket.on('resize', function(rows, cols) { stream.setWindow(rows, cols); });
                socket.on('disconnect', function(reason) { sshconn.end(); });
                socket.on('error', function(err) { sshconn.end(); });

                stream.on('data', function(data) { socket.emit('ssh-data', data.toString('utf-8')); })
                stream.on('close', function(code, signal) { sshconn.end(); })
            })
        }
    })

    sshconn.on('end', function(err) { sshError('Connect End by Host:', err); })
    sshconn.on('keyboard-interactive', function(name, instructions, lang, prompts, finish) { finish[host.pass] });
    sshconn.on('close', function(err) { sshError('Connect Close:', err); })
    sshconn.on('error', function(err) { sshError('Connect Error:', err); })
    sshconn.connect({
        host: host.ip,
        port: host.port || 22,
        username: host.user,
        password: host.pass,
        keepaliveInterval: 1000
    })

    function sshError(desc, err) {
        console.log(desc + err);
        socket.emit('ssh-error', desc + err);
        socket.disconnect(true);
    }
}

function sshConnectByTunnel(socket, host, type) {
    var config = {
        host: host.ip,
        port: host.port || 22,
        username: host.user,
        password: host.pass,
        dstHost: host.child.ip,
        dstPort: 22,
        localPort: 0,
        keepAlive: true,
        keepaliveInterval: 1000
    }
    var tnl = Tunnel(config, function(error, tnl) {
        console.log('tunnel:' + host.ip + ':' + (host.port || 22));
        host.child.ip = '127.0.0.1';
        host.child.port = tnl.address().port;
        sshConnect(socket, host.child, type);
    })
    tnl.on('error', function(err) {
        console.log('SSH Error', err)
    })
}

function sshConnect(socket, host, type) {
    if (host.child) {
        sshConnectByTunnel(socket, host, type);
    } else {
        sshConnectDirect(socket, host, type);
    }
}

function sftpListdir(socket, dir) {
    socket.sshconn.sftp(function(err, sftp) {
        if (err) {
            console.log("sftp list error:", err);
            socket.emit('read-dir-ack', [], err.message);
            sftp.end();
            return;
        }
        sftp.readdir(dir, function(err, list) {
            tmp = [];
            if (err) {
                console.log("sftp list error:", err);
                socket.emit('read-dir-ack', [], err.message);
                sftp.end();
                return;
            }
            //console.log(JSON.stringify(list));
            list.forEach((file) => {
                tmp.push({
                    name: file.filename,
                    type: file.attrs.isDirectory() ? 'dir' : file.attrs.isSymbolicLink() ? 'link' : 'file',
                    size: file.attrs.size,
                    mtime: file.attrs.mtime,
                    checked: false
                })
            })
            socket.emit('read-dir-ack', tmp);
            sftp.end();
        });
    });
}

function onClientConnectReq(socket, host, type) {
    let myClient = new MySSHClient();
    myClient.debug = console.log;
    if (type == 'sftp') {
        myClient.sftpConnect(host).then(() => {
            myClient.cwd().then((path) => {
                console.log("cwd:", path)
                socket.emit('ssh-conn-ack', path);
                socket.myClient = myClient;
            })
        })
    } else if (type == 'ssh') {
        myClient.sshConnect(host).then((stream) => {
            socket.on('ssh-data', function(data) { stream.write(data); });
            socket.on('resize', function(rows, cols) { stream.setWindow(rows, cols); });
            socket.on('disconnect', function(reason) { sshconn.end(); });
            socket.on('error', function(err) { sshconn.end(); });

            stream.on('data', function(data) { socket.emit('ssh-data', data.toString('utf-8')); })
            stream.on('close', function(code, signal) { sshconn.end(); })
            socket.emit('ssh-conn-ack');
        })
    }
}

function onClientListDirReq(socket, dir) {
    let myClient = socket.myClient;
    myClient.list(dir).then((list) => {
        let newList = list.map((item) => {
            return {
                name: item.name,
                type: item.type,
                size: item.size,
                mtime: item.modifyTime,
                checked: false
            }
        })
        console.log(newList)
        socket.emit('read-dir-ack', newList);
    }, (err) => {
        console.log(err);
    })
}

function onUploadReq(socket, localPath, remotePath, fileList) {
    let myClient = socket.myClient;
    myClient.sftpUpload(localPath, remotePath, fileList).then((result) => {
        console.log('upload success')
        socket.emit('upload-ack', '100');
    }, (err) => {
        console.log(err);
        socket.emit('upload-ack', '0', err);
    })
}

function onDownloadReq(socket, localPath, remotePath, fileList) {
    let myClient = socket.myClient;
    myClient.sftpDownload(localPath, remotePath, fileList).then((result) => {
        console.log('download success')
        socket.emit('download-ack', '100');
    }, (err) => {
        console.log(err);
        socket.emit('download-ack', '0', err);
    })
}

function onRenameReq(socket, oldname, newname) {
    let myClient = socket.myClient;
    myClient.rename(oldname, newname).then((result) => {
        console.log('rename success')
        socket.emit('rename-ack');
    }, (err) => {
        console.log(err);
        socket.emit('rename-ack', 'rename failed');
    })
}
module.exports = function ssh(socket) {
    socket.on('ssh-conn-req', function(host, type) {
        onClientConnectReq(socket, host, type);
    }).on('read-dir-req', function(dir) {
        onClientListDirReq(socket, dir);
    }).on('upload-req', function(localPath, remotePath, fileList) {
        onUploadReq(socket, localPath, remotePath, fileList);
    }).on('download-req', function(localPath, remotePath, fileList) {
        onDownloadReq(socket, localPath, remotePath, fileList);
    }).on('rename-req', function(oldname, newname) {
        onRenameReq(socket, oldname, newname);
    })
}