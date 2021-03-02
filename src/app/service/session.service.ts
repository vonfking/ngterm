import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as nodePTY from '@terminus-term/node-pty'
//import { MySSHClient } from 'myssh';
declare var MySSHClient: any; 

export abstract class BaseSession {
  isOpen: boolean

  protected error = new Subject<string>()
  protected output = new Subject<any>()
  protected opened = new Subject<void>()
  protected closed = new Subject<void>()
  protected destroyed = new Subject<void>()

  get error$ (): Observable<string> { return this.error }
  get output$ (): Observable<any> { return this.output }
  get opened$ (): Observable<void> { return this.opened }
  get closed$ (): Observable<void> { return this.closed }
  get destroyed$ (): Observable<void> { return this.destroyed }

  emitOutput (data: Buffer): void {
    this.output.next(data)
  }
  emitError (error: string): void {
    this.error.next(error)
  }

  async destroy (): Promise<void> {
      if (this.isOpen) {
          this.isOpen = false
          this.closed.next()
          this.destroyed.next()
          this.closed.complete()
          this.destroyed.complete()
          this.output.complete()
      }
  }
  open(data:any = null){
    this.isOpen = true
    this.opened.next(data);
  }

  abstract start (): void
  abstract resize (columns: number, rows: number): void
  abstract write (data: Buffer): void
  abstract kill (signal?: string): void
  list(dir: string, cb){}
  upload(localPath, remotePath, fileList, cb){}
  download(localPath, remotePath, fileList, cb){}
  rename(oldname, newname, cb){}
}

export class ptySession extends BaseSession {
  nodePTY: typeof nodePTY;
  private pty: any;
  constructor () {
    super()
    this.nodePTY = window.require('@terminus-term/node-pty');
  } 
  start (): void {
    this.pty = this.nodePTY.spawn('cmd.exe', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    });
    this.open();

    this.pty.on('data', (data: Buffer) => {
      this.emitOutput(data);
    })

    this.pty.on('exit', () => {
      if (this.isOpen) {
          this.destroy()
      }
    })

    this.pty.on('close', () => {
      if (this.isOpen) {
          this.destroy()
      }
    })
  }


  resize (cols: number, rows: number): void {
    if (this.pty._writable) {
      this.pty.resize(cols, rows)
    }
  }

  write (data: Buffer): void {
    if (this.isOpen) {
      if (this.pty._writable) {
        this.pty.write(data)
      } else {
        this.destroy()
      }
    }
  }

  kill (signal?: string): void {
    this.pty.kill(signal)
  }  
}
export class sshSession extends BaseSession {
  private host: any;
  //private MySSHClient: typeof MySSHClient;
  private sshClient: any;
  private sshStream: any;
  constructor (host:any) {
    super();
    //this.MySSHClient = window.require('myssh');
    this.host = host;
  } 
  start (): void {
    //this.sshClient = new this.MySSHClient();
    this.sshClient = new MySSHClient();
    this.sshClient.sshConnect(this.host).then((stream) => {
      this.sshStream = stream;
      this.open();
      stream.on('data', (data) => { 
        this.emitOutput( data ); 
      })
      stream.on('close', (code, signal) => {
        console.log("ssh closed")
        this.emitError('Connection is broken!');
      })
    }).catch((err: Error) => {
      this.emitError(err.message);
    });
  }

  resize (cols: number, rows: number): void {
    if (this.isOpen) {
      this.sshStream.setWindow(rows, cols)
    }
  }

  write (data: Buffer): void {
    if (this.isOpen) {
      this.sshStream.write(data);
    }
  }

  kill (signal?: string): void {
    this.sshClient.end();
  }  
}
export class sftpSession extends BaseSession {
  private host: any;
  private MySSHClient: typeof MySSHClient;
  private sshClient: any;
  private sshStream: any;
  constructor (host:any) {
    super();
    //this.MySSHClient = window.require('myssh');
    this.host = host;
  } 
  start (): void {
    this.sshClient = new MySSHClient();
    this.sshClient.sftpConnect(this.host).then(() => {
      this.sshClient.cwd().then((path) => {
        //console.log("cwd:", path)
        this.open(path);
    })
    }).catch((err: Error) => {
      this.emitError(err.message)
    });
  }
  list(dir: string, cb){
    this.sshClient.list(dir).then((list) => {
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
      cb(newList);
    }, (err) => {
      console.log(err);
      this.emitError(err.message)
    })
  }
  upload(localPath, remotePath, fileList, cb){
    this.sshClient.sftpUpload(localPath, remotePath, fileList).then((result) => {
        console.log('upload success')
        cb('100');
      }, (err) => {
        console.log(err);
        cb('0', err);
      })
  }
  download(localPath, remotePath, fileList, cb){
    this.sshClient.sftpDownload(localPath, remotePath, fileList).then((result) => {
      console.log('download success')
      cb('100');
    }, (err) => {
      console.log(err);
      cb('0', err);
    })
  }
  rename(oldname, newname, cb){
    this.sshClient.rename(oldname, newname).then((result) => {
      cb();
    }, (err) => {
      console.log(err);
      cb('rename failed');
    })
  }
  
  resize (cols: number, rows: number): void {
  }

  write (data: Buffer): void {
  }

  kill (signal?: string): void {
    this.sshClient.end();
  }  
}
export class forwardSession extends BaseSession {
  private host: any;
  private sshClient: any;
  constructor (host:any) {
    super();
    this.host = host;
  } 
  start (): void {
    this.sshClient = new MySSHClient();
    this.sshClient.forwardConnect(this.host).then((host) => {
      this.open(host);
      this.sshClient.on('forward', (data) => {
        this.emitOutput(data);
      })
    }).catch((err: Error) => {
      this.emitError(err.message);
    });
  }

  resize (cols: number, rows: number): void {
  }

  write (data: Buffer): void {
  }

  kill (signal?: string): void {
    this.sshClient.end();
  }  
}
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor() { }
  newSession(type: string, host:any = null): BaseSession{
    let session: BaseSession;
    if (type == 'ssh')
      session = new sshSession(host);
    else if (type == 'sftp')
      session = new sftpSession(host);
    else if (type == 'forward')
      session = new forwardSession(host);
    else if (type == 'local')
      session = new ptySession();
    session.start();
    return session;
  }
}
