import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Client } from 'ssh2';
export class Socket {
  private socket: any;
  private sshClient;

  constructor(){}
  connect(host: any, type: string, cb:any = null){
    this.socket = io('ws://127.0.0.1:9527');
    this.socket.on('connect', () => {
      this.socket.emit('ssh-conn-req', host, type);
    }).once('ssh-conn-ack', () => {
      if (cb)cb();
    });
    return new Observable(observer => {
      this.socket.on('ssh-conn-ack', (msg: any) => {
        observer.next({key:'ssh-conn-ack', data:msg});
      }).on('ssh-error', (msg: any) => {
        observer.next({key:'ssh-error', data:msg});
      }).on('ssh-data', (msg: any) => {
        observer.next({key:'ssh-data', data:msg});
      })
    })
  }
  
  readDir(dir: string, cb: any){
    this.socket.emit('read-dir-req', dir);
    this.socket.once('read-dir-ack', (filelist:any) =>{
      console.log("recv read-dir-ack");
      cb(filelist);
    })
  }
  sendMsg(msg: string){
    this.socket.emit('ssh-data', msg);
  }
  resize(rows: any, cols:any){
    this.socket.emit('resize', rows, cols);
  }
  disconnect(){
    this.socket.close();
  }
}
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor() { }
  newSocket(): any{
    return new Socket();
  }
}
