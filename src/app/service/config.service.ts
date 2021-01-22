import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private electron: ElectronService) { }
  keynum = 0;
  hostTreeList = [];
  loaded = false;
  
  isHost(item: any){
    return item.type == 'host' || item.type == 'subhost';
  }
  isGroup(item: any){
    return item.type == 'group';
  }
  getHostTreeList(): any {
    let _formatHostList = (hostList: any) => {
      hostList.forEach(host => {
        host.key = this.keynum++;
        host.selected = false;
        if (!host.children || host.children.lenth == 0){
          host.isLeaf = true;
        }else{
          host.isLeaf = false;
          _formatHostList(host.children);
        }
      });
    }
    if (!this.loaded){
      var strConfig: any= this.electron.fs.readFileSync('ngTermCfg.json');
      if (strConfig)this.hostTreeList = [JSON.parse(strConfig)];
      _formatHostList(this.hostTreeList);
      this.loaded = true;
    }
    return this.hostTreeList;
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
}
