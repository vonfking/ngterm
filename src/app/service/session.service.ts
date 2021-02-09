import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as nodePTY from '@terminus-term/node-pty'
import { MySSHClient } from 'myssh';
import { session } from 'electron';
export abstract class BaseSession {
  isOpen: boolean

  protected output = new Subject<string>()
  protected opened = new Subject<void>()
  protected closed = new Subject<void>()
  protected destroyed = new Subject<void>()

  get output$ (): Observable<string> { return this.output }
  get opened$ (): Observable<void> { return this.opened }
  get closed$ (): Observable<void> { return this.closed }
  get destroyed$ (): Observable<void> { return this.destroyed }

  emitOutput (data: Buffer): void {
    this.output.next(data.toString())
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
  open(){
    this.isOpen = true
    this.opened.next();
  }

  abstract start (): void
  abstract resize (columns: number, rows: number): void
  abstract write (data: Buffer): void
  abstract kill (signal?: string): void
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
  private MySSHClient: typeof MySSHClient;
  private sshClient: any;
  private sshStream: any;
  constructor (host:any) {
    super();
    this.MySSHClient = window.require('myssh');
    this.host = host;
  } 
  start (): void {
    this.sshClient = new this.MySSHClient();
    this.sshClient.sshConnect(this.host).then((stream) => {
      this.open();
      this.sshStream = stream;
      stream.on('data', (data) => { 
        this.emitOutput( data ); 
      })
      stream.on('close', (code, signal) => {
        console.log("ssh closed")
      })
    })
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
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor() { }
  newSession(type: string, host:any = null): BaseSession{
    let session: BaseSession;
    if (type == 'ssh')
      session = new sshSession(host);
    else 
      session = new ptySession();
    session.start();
    return session;
  }
}
