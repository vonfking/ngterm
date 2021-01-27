import { Injectable } from '@angular/core';
import { title } from 'process';
import { Subject } from 'rxjs';
import { ElectronService } from './electron.service';

export interface Host{
  title: string,
  key: number,
  type: "root"|"group"|"host"|"subhost",
  children: Host[],
  ip?: string,
  port?: number,
  user?: string,
  pass?: string
 }
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private electron: ElectronService) { }
  keynum = 1;
  hostConfig: Host;
  loaded = false;
  configFile = 'ngTermCfg.json';
  
  isHost(item: any){
    return item.type == 'host' || item.type == 'subhost';
  }
  isGroup(item: any){
    return item.type == 'group';
  }
  getHostTreeList(): any {
    let _formatHostList = (hostList: any) => {
      if (!hostList)return;
      hostList.forEach(host => {
        host.key = this.keynum++;
        //host.selected = false;
        if (!host.children || host.children.lenth == 0){
          //host.isLeaf = true;
        }else{
          //host.isLeaf = false;
          _formatHostList(host.children);
        }
      });
    }
    if (!this.loaded){
      var strConfig: any= this.electron.fs.readFileSync(this.configFile);
      if (strConfig)this.hostConfig = JSON.parse(strConfig);
      _formatHostList(this.hostConfig.children);
      this.loaded = true;
    }
    return this.hostConfig;
  }
  getGroupArray(host: any){
    let groups = [];
    if (host && host.children){
      host.children.forEach(item => {
        if (this.isGroup(item)){
          item.hostnum = this.getHostArray(item, null, false, false).length;
          groups.push(item);
        }
      })
    }
    return groups;
  }
  getHostArray(host: any, rootGroup = null, recursive = true, change = true){
    let hosts = [];
    if (host && host.children){
      host.children.forEach(item => {
        if (this.isHost(item)){
          if (change){
            if (this.isHost(host)) item.hopIp = host.ip;
            if (rootGroup) item.group = rootGroup;
          }
          hosts.push(item);
        }
        if (recursive){
          if (rootGroup == null && this.isGroup(item))rootGroup = item.title;
          hosts.push.apply(hosts, this.getHostArray(item, rootGroup, recursive, change));
        }
      })
    }
    return hosts;
  }

  private tabSubject = new Subject();
  newTab(tab){
    this.tabSubject.next(tab);
  }
  onNewTab(cb){
    return this.tabSubject.asObservable().subscribe(tab => cb(tab));
  }

  getIconByType(type){
    return type == 'ssh' ? 'code' : (type == 'sftp' ? 'read' : 'windows');
  }
  newHost(type){
    return {
      type: type,
      key: this.keynum++,
      title: '',
      children: [],
      ip: '',
      port: 22,
      user: '',
      pass: ''
    }
  }
  copyHost(host1, host2){
    host1.type = host2.type;
    host1.key  = host2.key;
    host1.title= host2.title;
    host1.ip   = host2.ip;
    host1.port = host2.port;
    host1.user = host2.user;
    host1.pass = host2.pass;
  }
  deleteHost(baseHost:Host, host:Host){
    if (!baseHost.children)return;
    for (let i=0; i<baseHost.children.length; i++){
      let tmp:Host = baseHost.children[i];
      if (tmp.key == host.key){
        baseHost.children.splice(i, 1);
        this.electron.fs.writeFileSync(this.configFile, JSON.stringify(this.hostConfig, null, 4));
        return true;
      }else if(this.deleteHost(tmp, host)){
        return true;
      }
    }
    return false;
  }
  saveHost(baseHost, host){
    let isModify = false;
    for (let h of baseHost.children){
      if (h.key == host.key){
        this.copyHost(h, host);
        isModify = true;  
      }
    }
    if (!isModify){
      baseHost.children.push(host);
    }
    this.electron.fs.writeFileSync(this.configFile, JSON.stringify(this.hostConfig, null, 4));
  }
}
