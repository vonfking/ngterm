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
    }).once('ssh-conn-ack', (path) => {
      if (cb)cb(path);
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
  upload(localPath:string, remotePath:string, fileList:any, cb:any){
    this.socket.emit('upload-req', localPath, remotePath, fileList);
    this.socket.on('upload-ack', (progress, error) => {
      if (error || progress == '100'){
        this.socket.removeListener('upload-ack');
      }
      cb(progress, error);
    })
  }
  download(localPath:string, remotePath:string, fileList:any, cb:any){
    this.socket.emit('download-req', localPath, remotePath, fileList);
    this.socket.on('download-ack', (progress, error) => {
      if (error || progress == '100'){
        this.socket.removeListener('download-ack');
      }
      cb(progress, error);
    })
  }
  rename(oldname:string, newname:string, cb:any){
    this.socket.emit('rename-req', oldname, newname);
    this.socket.once('rename-ack', (error) => {
      cb(error);
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
