import { Component, OnInit } from '@angular/core';
import { NotifyService } from '../../service/notify.service';
import { ConfigService, Host } from '../../service/config.service';

@Component({
  selector: 'app-hostcfg',
  templateUrl: './hostcfg.component.html',
  styleUrls: ['./hostcfg.component.css']
})
export class HostcfgComponent implements OnInit {

  constructor(public config: ConfigService, private notify: NotifyService) { }

  hostConfig: Host;
  baseHost: Host;
  hosts=[]
  groups=[]
  grouplist=[];
  ngOnInit(): void {
    this.hostConfig = this.config.getHostTreeList();
    if (this.hostConfig){
      this.refresh(this.hostConfig);
    }    
  }
  refresh(host){
    this.groups = this.config.getGroupArray(host);
    this.hosts = this.config.getHostArray(host);  
    if (this.baseHost != host){
      this.grouplist.push(host);
      this.baseHost = host;
    } 
  }
  spliceGroup(index){
    let group = this.grouplist[index];
    this.grouplist.splice(index, this.grouplist.length - index);
    this.refresh(group);
  }
  public isEditing = false;
  public editTitle = "";
  public editHost: Host = this.config.newHost('host');
  openEditDrawer(host: string | Host){
    if (typeof host === 'string'){
      let type = host;
      this.editTitle = "New " + type;
      this.editHost = this.config.newHost(type.toLowerCase());
    }
    else{
      this.editTitle = "Edit " + this.config.isGroup(host)?'Group':'Host';
      this.config.copyHost(this.editHost, host);
    }
    this.isEditing = true;
  }
  closeEditDrawer(){
    this.isEditing = false;
  }
  saveEditDrawer(){
    this.config.modifyHost(this.baseHost, this.editHost);
    this.refresh(this.baseHost);
    this.isEditing = false;
  }
  onOperation(type, host){
    if (type == "dblclick"){
      if (this.config.isGroup(host))this.refresh(host);
      else this.notify.emitOpenTab({type: 'ssh', host: host});
    } else if (type == 'edit'){
      this.openEditDrawer(host);
    } else if (type == 'delete'){
      this.config.deleteHost(this.baseHost, host);
      this.refresh(this.baseHost);
    } else if (type == 'openssh'){
      this.notify.emitOpenTab({type: 'ssh', host: host});
    } else if (type == 'opensftp'){
      this.notify.emitOpenTab({type: 'sftp', host: host});
    }
  }
}
