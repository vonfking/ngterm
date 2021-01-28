var MySSHClient = require('./myssh');
var pty = require('@terminus-term/node-pty')

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
            socket.on('resize', function(cols, rows) { stream.setWindow(rows, cols); });
            socket.on('disconnect', function(reason) {
                console.log("ssh disconnect", reason)
                myClient.end();
            });
            socket.on('error', function(err) { myClient.end(); });

            stream.on('data', function(data) { socket.emit('ssh-data', data.toString('utf-8')); })
            stream.on('close', function(code, signal) {
                console.log("ssh closed")
                socket.emit('ssh-conn-close');
            })
            socket.emit('ssh-conn-ack');
        })
    }
}

function onLocalShellReq(socket) {
    socket.emit('ssh-conn-ack');
    var ptyProcess = pty.spawn('cmd.exe', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });
    ptyProcess.on('data', (data) => {
        socket.emit('ssh-data', data.toString('utf-8'));
    })
    socket.on('resize', (cols, rows) => ptyProcess.resize(cols, rows));
    socket.on('ssh-data', (data) => ptyProcess.write(data));
    socket.on('disconnect', function(reason) {
        console.log("local disconnect", reason)
        ptyProcess.end();
    });
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
    socket.onAny((event, ...args) => {
        console.log(`got ${event}`);
    });
    socket.on('ssh-conn-req', function(host, type) {
        if (type == 'local') onLocalShellReq(socket);
        else onClientConnectReq(socket, host, type);
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