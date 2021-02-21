import { Component, OnInit } from '@angular/core';
import { NotifyService } from '../../service/notify.service';
import { HostConfigService, Host } from '../../service/config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-hostcfg',
  templateUrl: './hostcfg.component.html',
  styleUrls: ['./hostcfg.component.css']
})
export class HostcfgComponent implements OnInit {

  constructor(private fb: FormBuilder, public hostCfg: HostConfigService, private notify: NotifyService) { }

  hostConfig: Host;
  baseHost: Host;
  hosts: Host[]=[];
  groups: Host[]=[];
  grouplist: Host[]=[];
  showAllSub = true;
  ngOnInit(): void {
    this.hostConfig = this.hostCfg.getHostConfig();
    if (this.hostConfig){
      this.refresh(this.hostConfig);
    }
    this.formInit();    
  }
  refresh(host: Host){
    this.groups = this.hostCfg.getChildGroups(host);
    this.hosts = this.hostCfg.getChildHosts(host, this.showAllSub);  
    if (this.baseHost != host){
      this.grouplist = this.hostCfg.getHostPath(host);
      this.baseHost = host;
    } 
  }
  changeGroup(index){
    let group = this.grouplist[index];
    this.refresh(group);
  }
  public isEditing = false;
  public editTitle = "";
  public editHost: Host = this.hostCfg.newHost('host');
  openEditDrawer(host: string | Host){
    if (typeof host === 'string'){
      let type = host;
      this.editTitle = "New " + type;
      this.editHost = this.hostCfg.newHost(type.toLowerCase());
    }
    else{
      this.editTitle = "Edit " + (this.hostCfg.isGroup(host)?'Group':'Host');
      this.hostCfg.copyHost(this.editHost, host);
    }
    this.isEditing = true;
  }
  closeEditDrawer(){
    this.isEditing = false;
  }
  saveEditDrawer(){
    this.hostCfg.modifyHost(this.baseHost, this.editHost);
    this.refresh(this.baseHost);
    this.isEditing = false;
  }
  onOperation(type: string, host: Host){
    if (type == "dblclick"){
      if (this.hostCfg.isGroup(host))this.refresh(host);
      else this.notify.emitOpenTab({type: 'ssh', host: this.hostCfg.getConnectHost(host)});
    } else if (type == 'edit'){
      this.openEditDrawer(host);
    } else if (type == 'editchild'){
      this.refresh(host);
    } else if (type == 'delete'){
      this.hostCfg.deleteHost(this.baseHost, host);
      this.refresh(this.baseHost);
    } else if (type == 'ssh' || type == 'sftp' || type == 'forward'){
      this.notify.emitOpenTab({type: type, host: this.hostCfg.getConnectHost(host)});
    }
  }
  //Form
  validateForm!: FormGroup;
  formInit(){
    this.validateForm = this.fb.group({
      title: [this.editHost.title, [Validators.required]],
      ip: [this.editHost.ip],
      port: [this.editHost.port],
      isForward: [this.editHost.forward],
      user: [this.editHost.user],
      pass: [this.editHost.pass],
      localPort:[this.editHost.localPort]
    });
  }
}
