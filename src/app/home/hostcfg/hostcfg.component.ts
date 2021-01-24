import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';

@Component({
  selector: 'app-hostcfg',
  templateUrl: './hostcfg.component.html',
  styleUrls: ['./hostcfg.component.css']
})
export class HostcfgComponent implements OnInit {

  constructor(public config: ConfigService) { }

  hostlist=[];
  hosts=[]
  groups=[]
  grouplist=[];
  ngOnInit(): void {
    this.hostlist = this.config.getHostTreeList();
    if (this.hostlist && this.hostlist.length > 0){
      this.refresh(this.hostlist[0]);
    }    
  }
  refresh(group){
    this.groups = this.config.getGroupArray(group);
    this.hosts = this.config.getHostArray(group);  
    this.grouplist.push(group);
  }
  spliceGroup(index){
    let group = this.grouplist[index];
    this.grouplist.splice(index, this.grouplist.length - index);
    this.refresh(group);
  }
  public isEditing = false;
  public editTitle = "";
  public editHost = {
    type: 'host',
    title: '',
    ip: '',
    port: 22,
    user: '',
    pass: ''
  };
  openEditDrawer(oper: 'New'| 'Edit', type: 'Host'| 'Group', host:any = null){
    this.editTitle = oper + " " + type;
    if (oper == 'New' && type == 'Host'){
      this.editHost = {
        type: 'host',
        title: '',
        ip: '',
        port: 22,
        user: '',
        pass: ''
      }
    }
    else if (oper == 'New' && type == 'Group'){
      this.editHost = {
        type: 'group',
        title: '',
        ip: '',
        port: 22,
        user: '',
        pass: ''
      }
    }
    this.isEditing = true;
  }
  closeEditDrawer(){
    this.isEditing = false;
  }
}
