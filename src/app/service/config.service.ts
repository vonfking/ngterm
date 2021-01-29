import { Injectable } from '@angular/core';
import { title } from 'process';
import { Subject } from 'rxjs';
import { ElectronService } from './electron.service';

export interface Host{
  title: string,
  type: "root"|"group"|"host"|"subhost",
  key?: number,
  children?: Host[],
  ip?: string,
  port?: number,
  user?: string,
  pass?: string,
  parent?: Host,
  child?: Host,
  hopIp?: string,
  group?: string
 }
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private electron: ElectronService) { }
  keynum = 0;
  hostConfig: Host;
  loaded = false;
  configFile = 'ngTermCfg.json';
  
  isHost(item: any){
    return item.type == 'host' || item.type == 'subhost';
  }
  isGroup(item: any){
    return item.type == 'group';
  }
  getIconByType(type){
    return type == 'ssh' ? 'code' : (type == 'sftp' ? 'read' : 'windows');
  }
  getHostConfig(): any {
    let _formatHostConfig = (host: Host) => {
      if (!host.children)
        host.children = [];
      host.children.forEach(subhost => {
        subhost.key = this.keynum++;
        subhost.parent = host;
        _formatHostConfig(subhost);
      });
    }
    if (!this.loaded){
      var strConfig: any;
      try{
        strConfig = this.electron.fs.readFileSync(this.configFile);
        if (strConfig)this.hostConfig = JSON.parse(strConfig);
      }catch(e){
        this.hostConfig = this.newHost("root", "ROOT");
      }
      _formatHostConfig(this.hostConfig);
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
  getHostArray(host: Host, rootGroup = null, recursive = true, change = true){
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
  getConnectHost(host: Host, subhost:Host = null):Host{
    let tmpHost: Host = this.newHost('host');
    this.copyHost(tmpHost, host);
    if (subhost) tmpHost.child = subhost;
    if (host.parent && this.isHost(host.parent)){
      return this.getConnectHost(host.parent, tmpHost);
    }else{
      return tmpHost;
    }
  }
  newHost(type: any, title=''){
    if (type == 'group' || type == 'root'){
      return{
        type: type,
        key: this.keynum++,
        title: title
      }  
    }else{
      return {
        type: type,
        key: this.keynum++,
        title: title,
        ip: '',
        port: 22,
        user: '',
        pass: ''
      }
    }
  }
  copyHost(host1: Host, host2: Host, withoutKey=false, deepCopy=false){
    host1.type = host2.type;
    host1.key  = host2.key;
    host1.title= host2.title;
    if (withoutKey)delete host1.key;
    if (this.isHost(host2)){
      host1.ip   = host2.ip;
      host1.port = host2.port;
      host1.user = host2.user;
      host1.pass = host2.pass;
    }
    if (deepCopy && host2.children && host2.children.length > 0){
      host1.children = [];
      for (let h of host2.children){
        let tmpHost: Host = this.newHost(h.type);
        this.copyHost(tmpHost, h, withoutKey, deepCopy);
        host1.children.push(tmpHost);
      }
    }
  }
  deleteHost(baseHost: Host, host: Host){
    if (!baseHost.children)return;
    for (let i=0; i<baseHost.children.length; i++){
      let tmp:Host = baseHost.children[i];
      if (tmp.key == host.key){
        baseHost.children.splice(i, 1);
        this.saveConfig();
        return true;
      }else if(this.deleteHost(tmp, host)){
        return true;
      }
    }
    return false;
  }
  modifyHost(baseHost: Host, host: Host){
    let isModify = false;
    for (let h of baseHost.children){
      if (h.key == host.key){
        this.copyHost(h, host);
        isModify = true;  
      }
    }
    if (!isModify){
      baseHost.children.push(host);
      host.parent = baseHost;
    }
    this.saveConfig();
  }
  saveConfig(){
    let tmpHost: Host = this.newHost('root');
    this.copyHost(tmpHost, this.hostConfig, true, true);
    this.electron.fs.writeFileSync(this.configFile, JSON.stringify(this.hostConfig, null, 4));
  }
}
