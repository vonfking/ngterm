import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private electron: ElectronService) { }
  keynum = 0;
  hostTreeList = [];
  loaded = false;
  formatHostList(hostList: any){
    hostList.forEach(host => {
      host.key = this.keynum++;
      host.selected = false;
      if (!host.children || host.children.lenth == 0){
        host.isLeaf = true;
      }else{
        host.isLeaf = false;
        this.formatHostList(host.children);
      }
    });
  }
  getHostTreeList(): any {
    if (!this.loaded){
      var strConfig: any= this.electron.fs.readFileSync('ngTermCfg.json');
      if (strConfig)this.hostTreeList = [JSON.parse(strConfig)];
      this.formatHostList(this.hostTreeList);
      this.loaded = true;
    }
    return this.hostTreeList;
  }
  getGroupArray(host: any){
    let groups = [];
    if (host && host.children){
      host.children.forEach(item => {
        if (item.type == 'group'){
          groups.push(item);
        }
      })
    }
    return groups;
  }
  getHostArray(host: any){
    let hosts = [];
    if (host && host.children){
      host.children.forEach(item => {
        if (item.type == 'host' ||item.type == 'subhost'){
          hosts.push(item);
        }
        hosts.push.apply(hosts, this.getHostArray(item));
      })
    }
    return hosts;
  }
}
