import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ElectronService } from '../service/electron.service';
import { Socket, SocketService } from '../service/socket.service';
import { FilelistComponent } from './filelist/filelist.component';

@Component({
  selector: 'app-sftp',
  templateUrl: './sftp.component.html',
  styleUrls: ['./sftp.component.css']
})
export class SftpComponent implements OnInit {
  localPath  = 'C:\\';
  remotePath = '/';
  localFiles =[]
  remoteFiles=[]
  isLocalSpinning = false
  isRemoteSpinning = false
  isSpinning = false
  constructor(private socketService: SocketService, private electonService: ElectronService) { }

  prefix(n){
    const str = '' + n;
    if (str.length < 2) {
      return '0' + str;
    }
    return str;
  }
  formatTime(time :any = new Date(), format = 'yyyy-mm-dd HH:MM:SS'){
    const t = new Date(time);
    const y = t.getFullYear();
    const m = t.getMonth();
    const d = t.getDate();
    const H = t.getHours();
    const M = t.getMinutes();
    const S = t.getSeconds();
    return format.replace('yyyy', this.prefix(y))
    .replace('mm', this.prefix(m + 1))
    .replace('dd', this.prefix(d))
    .replace('HH', this.prefix(H))
    .replace('MM', this.prefix(M))
    .replace('SS', this.prefix(S))
  }
  getLocalFiles(dir){
    this.isLocalSpinning = true;
    var filelist = []
    var files = this.electonService.fs.readdirSync(dir, {withFileTypes: true});
    files.forEach(file=>{
      try{
        var states = this.electonService.fs.statSync(this.electonService.path.join(dir, file.name));
        filelist.push({
          name: file.name,
          type: states.isDirectory()?'d':'-',
          size: states.size,
          mtime: this.formatTime(states.mtimeMs),
          checked: false
        })
      }catch(e){
      }      
    })
    this.localFiles = filelist;
    this.isLocalSpinning = false;
  }
  getRemoteFiles(dir){
    this.isRemoteSpinning = true;
    this.socket.readDir(dir, (list) => {
      list.forEach(file => {
        file.mtime = this.formatTime(file.mtime);
      })
      this.remoteFiles = list;
      this.isRemoteSpinning = false;
    });
  }
  socket: Socket;
  host:any;
  @Input('hostInfo')
  set _hostInfo(hostinfo: any){
    this.host = hostinfo;
  }
  @ViewChildren(FilelistComponent) componentChildList: QueryList<FilelistComponent>
  onSplitterChange(e: any){
    this.componentChildList.forEach(elementRef => elementRef.setTableSize);
  }
  ngOnInit(): void {
    this.localPath = this.electonService.app.getAppPath();
    this.getLocalFiles(this.localPath);
    this.socket = this.socketService.newSocket();
    this.socket.connect(this.host, 'sftp', (path) =>{
      this.remotePath = path;
      this.getRemoteFiles(path);
    });
  }

  onLocalPathChange(e:any){
    console.log('recv change:', e);
    if (e.type == 'relative'){
      this.localPath = this.electonService.path.join(this.localPath, e.path);
    }else{
      this.localPath = e.path;
    }
    this.getLocalFiles(this.localPath);
  }
  onRemotePathChange(e:any){
    console.log('recv change:', e);
    if (e.type == 'relative'){
      this.remotePath = this.electonService.path.join(this.remotePath, e.path).split(this.electonService.path.sep).join('/');    
    }else{
      this.remotePath = e.path;
    }
    this.getRemoteFiles(this.remotePath);
  }
  onLocalFileOperation(e){
    this.isSpinning = true;
    if (e.type == 'updown'){
      this.socket.upload(this.localPath, this.remotePath, e.fileList, (progress, error) => {
        if (error || progress == '100'){
          this.isSpinning = false;
          this.getRemoteFiles(this.remotePath);
        }
      })
    }
  }
  onRemoteFileOperation(e){
  }
}
