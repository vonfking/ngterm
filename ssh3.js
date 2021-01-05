var MySSHClient = require('./myssh');

/*
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

client3 = new MySSHClient()
client3.sftpConnect({
    ip: '192.168.3.135',
    user: 'ubuntu',
    pass: 'vonf99',
    child: {
        ip: '172.17.0.1',
        user: 'ubuntu',
        pass: 'vonf99',
    }
}).then(() => {
    client3.cwd().then((path) => {
        console.log(path);
        client3.list(path).then((list) => {
            console.log(list)
            console.log('---------------------------------------')
            console.log('=======================================')
            client3.end();
        })
    })

})
client4 = new MySSHClient()
client4.on('progress', (data) => {
    console.log(`downloading ${data.file}, progress: ${data.fileTrans}/${data.fileSize}, total:${data.totalTrans}/${data.totalSize}`)
})
client4.sftpConnect({
    ip: '192.168.3.135',
    user: 'ubuntu',
    pass: 'vonf99',
    child: {
        ip: '172.17.0.1',
        user: 'ubuntu',
        pass: 'vonf99',
    }
}).then(() => {
    return client4.sftpDownload('D:/tmp', '/home/ubuntu', [{ type: '-', name: '1.dat' }, { type: 'd', name: 'l1' }, { type: 'd', name: 'l2' }])
}).then((data) => {
    console.log(data);
    client4.end();
}).catch((err) => {
    console.log(err);
})
*/

client5 = new MySSHClient()
client5.on('progress', (data) => {
    console.log(`uploading ${data.file}, progress: ${data.fileTrans}/${data.fileSize}, total:${data.totalTrans}/${data.totalSize}`)
})
client5.sftpConnect({
    ip: '192.168.3.135',
    user: 'ubuntu',
    pass: 'vonf99',
    child: {
        ip: '172.17.0.1',
        user: 'ubuntu',
        pass: 'vonf99',
    }
}).then(() => {
    return client5.sftpUpload('D:/tmp', '/tmp/l1', [{ type: '-', name: '1.dat' }, { type: 'd', name: 'l1' }, { type: 'd', name: 'l2' }])
}).then((data) => {
    console.log(data);
    client5.end();
}).catch((err) => {
    console.log(err);
})