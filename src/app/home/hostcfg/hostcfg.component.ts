import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';

@Component({
  selector: 'app-hostcfg',
  templateUrl: './hostcfg.component.html',
  styleUrls: ['./hostcfg.component.css']
})
export class HostcfgComponent implements OnInit {

  constructor(private config: ConfigService) { }

  hostlist=[];
  hosts=[]
  groups=[]
  ngOnInit(): void {
    this.hostlist = this.config.getHostTreeList();
    if (this.hostlist && this.hostlist.length > 0){
      this.groups = this.config.getGroupArray(this.hostlist[0]);
      this.hosts = this.config.getHostArray(this.hostlist[0]);  
    }
  }

}
