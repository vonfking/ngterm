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
  parentHost: Host;
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
      this.parentHost = this.baseHost;
    }
    else{
      this.editTitle = "Edit " + (this.hostCfg.isGroup(host)?'Group':'Host');
      this.hostCfg.copyHost(this.editHost, host);
      this.parentHost = host.parent;
    }
    this.formReset(this.editHost);
    this.isEditing = true;
  }
  closeEditDrawer(){
    this.isEditing = false;
  }
  saveEditDrawer(){
    if (!this.formCheck(this.editHost))return;
    this.hostCfg.modifyHost(this.parentHost, this.editHost);
    this.refresh(this.baseHost);
    this.isEditing = false;
  }
  onOperation(type: string, host: Host){
    if (type == "dblclick"){
      if (this.hostCfg.isGroup(host))this.refresh(host);
      else {
        if (this.hostCfg.isNotForward(host))
          this.notify.emitOpenTab({type: 'ssh', host: this.hostCfg.getConnectHost(host)});
        else
          this.notify.emitOpenTab({type: 'forward', host: this.hostCfg.getConnectHost(host)});
      }
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
      title: [null, [Validators.required]],
      ip: [null, [Validators.required]],
      port: [null, [Validators.required]],
      isForward: [null, [Validators.required]],
      user: [null, [Validators.required]],
      pass: [null, [Validators.required]],
      localPort:[null, [Validators.required]]
    });
  }
  formReset(host: Host){
    this.validateForm.reset();
    this.validateForm.get('title')!.setValue(host.title);
    this.validateForm.get('ip')!.setValue(host.ip);
    this.validateForm.get('port')!.setValue(host.port);
    this.validateForm.get('isForward')!.setValue(host.forward);
    this.validateForm.get('user')!.setValue(host.user);
    this.validateForm.get('pass')!.setValue(host.pass);
    this.validateForm.get('localPort')!.setValue(host.localPort);
    for (const i in this.validateForm.controls){
      this.validateForm.controls[i].setValidators(Validators.required);
      this.validateForm.controls[i].markAsPristine();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  }
  formCheck(host: Host):boolean{
    let check=[], nocheck=[];
    if (this.hostCfg.isGroup(host)){
      check = ['title'];
      nocheck = ['ip', 'port', 'user', 'pass', 'localPort', 'isForward'];
    }else{
      if (this.validateForm.get('isForward')!.value){
        check = ['title', 'ip', 'port', 'localPort'];
        nocheck = ['user', 'pass', 'isForward'];
      }else{
        check = ['title', 'ip', 'port', 'user', 'pass'];
        nocheck = ['localPort', 'isForward'];
      }
    }
    
    for (const i in check){
      this.validateForm.get(check[i])!.setValidators(Validators.required);
      this.validateForm.get(check[i])!.markAsDirty();
      this.validateForm.get(check[i])!.updateValueAndValidity();
    }
    for (const i in nocheck){
      this.validateForm.get(nocheck[i])!.clearValidators();
      this.validateForm.get(nocheck[i])!.markAsPristine();
      this.validateForm.get(nocheck[i])!.updateValueAndValidity();
    }
    if (this.validateForm.valid){
      host.title = this.validateForm.get('title')!.value;
      host.ip = this.validateForm.get('ip')!.value;
      host.port = this.validateForm.get('port')!.value;
      host.forward = this.validateForm.get('isForward')!.value;
      host.user = this.validateForm.get('user')!.value;
      host.pass = this.validateForm.get('pass')!.value;
      host.localPort = this.validateForm.get('localPort')!.value;
    }
    return this.validateForm.valid;
  }
}
