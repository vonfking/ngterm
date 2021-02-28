import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { ElectronService } from '../../service/electron.service';
import { NotifyService } from '../../service/notify.service';
import { BaseSession, SessionService } from '../../service/session.service';
import { BaseTabComponent } from '../base-tab/base-tab.component';
import { FilelistComponent } from './filelist/filelist.component';

@Component({
  selector: 'app-sftp',
  templateUrl: './sftp.component.html',
  styleUrls: ['./sftp.component.css']
})
export class SftpComponent extends BaseTabComponent implements OnInit, OnDestroy {
  localPath  = 'C:\\';
  remotePath = '/';
  localFiles =[]
  remoteFiles=[]
  isLocalSpinning = false
  isRemoteSpinning = false
  isSpinning = false
  subscription: Subscription;
  
  //constructor(private notify: NotifyService, private sessionService: SessionService, private electon: ElectronService, private message: NzMessageService) { }
  private notify: NotifyService;
  private electon: ElectronService;
  private message: NzMessageService;
  constructor(protected injector: Injector) { 
    super(injector.get(SessionService));
    this.notify = injector.get(NotifyService);
    this.electon = injector.get(ElectronService);
    this.message = injector.get(NzMessageService);
  }
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
    var files = this.electon.fs.readdirSync(dir, {withFileTypes: true});
    files.forEach(file=>{
      try{
        var states = this.electon.fs.statSync(this.electon.path.join(dir, file.name));
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
    this.session.list(dir, (list) => {
      list.forEach(file => {
        file.mtime = this.formatTime(file.mtime);
      })
      this.remoteFiles = list;
      this.isRemoteSpinning = false;
    });
  }
  @ViewChildren(FilelistComponent) componentChildList: QueryList<FilelistComponent>
  newSftpSession(){
    this.newSession(
      (path) => { this.remotePath = path; this.getRemoteFiles(path); },
      (data) => { },
      (error) => {this.isRemoteSpinning = false; }
    );
  }
  onSplitterChange(e: any){
    //this.componentChildList.forEach(elementRef => elementRef.setTableSize());
    this.notify.emitSftpWindowChange();
  }
  ngOnInit(): void {
    this.localPath = this.electon.app.getAppPath();
    this.getLocalFiles(this.localPath);
    this.newSftpSession();
    this.subscription = this.notify.onMainTabIndexChange((index) => {
      if (index == this.tabIndex) {
        this.notify.emitSftpWindowChange();
      }
    })
  }
  ngOnDestroy(): void{
    this.session.kill();
    this.subscription.unsubscribe();
  }
  onLocalPathChange(e:any){
    console.log('recv change:', e);
    if (e.type == 'relative'){
      this.localPath = this.getRealPath(this.localPath, e.path);
    }else{
      this.localPath = e.path;
    }
    this.getLocalFiles(this.localPath);
  }
  getRealPath(path, name, type='win'){
    let _path = this.electon.path.join(path, name);
    if (type == 'linux'){
      return _path.split(this.electon.path.sep).join('/'); 
    }
    return _path;
  }
  onRemotePathChange(e:any){
    console.log('recv change:', e);
    if (this.state == "CONNECTED"){
      if (e.type == 'relative'){
        this.remotePath = this.getRealPath(this.remotePath, e.path, 'linux');    
      }else{
        this.remotePath = e.path;
      }
      this.getRemoteFiles(this.remotePath);
    }
    if (this.state == "ERROR" && e.type == 'absolute'){
      this.newSftpSession();
    }
  }
  onLocalFileOperation(e){
    this.isSpinning = true;
    if (e.type == 'updown'){
      this.session.upload(this.localPath, this.remotePath, e.fileList, (progress, error) => {
        if (error || progress == '100'){
          this.isSpinning = false;
          this.getRemoteFiles(this.remotePath);
        }
        if (error){
          this.message.create('error', 'upload failed:'+ error);
        }
      })
    }else if (e.type == 'rename'){
      let oldname = this.getRealPath(this.localPath, e.oldname);
      let newname = this.getRealPath(this.localPath, e.newname);
      this.electon.fs.renameSync(oldname, newname);
      this.isSpinning = false;
    }
  }
  onRemoteFileOperation(e){
    this.isSpinning = true;
    if (e.type == 'updown'){
      this.session.download(this.localPath, this.remotePath, e.fileList, (progress, error) => {
        if (error || progress == '100'){
          this.isSpinning = false;
          this.getLocalFiles(this.localPath);
        }
        if (error){
          this.message.create('error', 'download failed:'+ error);
        }
      })
    }else if (e.type == 'rename'){
      let oldname = this.getRealPath(this.remotePath, e.oldname, 'linux');
      let newname = this.getRealPath(this.remotePath, e.newname, 'linux');
      this.session.rename(oldname, newname, (error) => {
        if (error) {
          this.getRemoteFiles(this.remotePath);
          this.message.create('error', 'rename failed:'+ error);
        }
        this.isSpinning = false;
      });
    }
  }
}
