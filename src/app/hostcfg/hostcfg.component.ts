import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { ElectronService } from '../service/electron.service';

@Component({
  selector: 'app-hostcfg2',
  templateUrl: './hostcfg.component.html',
  styleUrls: ['./hostcfg.component.css']
})
export class HostcfgComponent2 implements AfterViewInit {

  @Input() title?: string;
  @Input() subtitle?: string;
  keynum = 0;
  hostlist = [
    {
      title: 'ROOT', 
      type: 'root',
      children: [{
        title: '192.168.3.135',
        type: 'host',
        ip:'192.168.3.135', port:22, user:'ubuntu', pass:'vonf99',
        children: [
          {
            title: '172.17.0.1',
            type:'subhost',
            ip:'172.17.0.1', port:22,  user:'ubuntu', pass:'vonf99',children: [
              {
                title: '192.168.3.135',
                type:'subhost',
                ip:'192.168.3.135', port:22, user:'ubuntu', pass:'vonf99',
              },{
                title: '172.1.1.2',
                type:'subhost',
                ip:'172.1.1.2', port:22,  user:'ubuntu2', pass:'vonf9912',
              },]
          },{
            title: '172.1.1.2',
            type:'subhost',
            ip:'172.1.1.2', port:22,  user:'ubuntu2', pass:'vonf9912',
          },]
      },{
        title: 'group1',
        type: 'group',
        children: [
          {
            title: '172.1.1.1',
            type:'host',
            ip:'172.1.1.1', port:22,  user:'ubuntu1', pass:'vonf991',
          },{
            title: '172.1.1.2',
            type:'host',
            ip:'172.1.1.2', port:22,  user:'ubuntu2', pass:'vonf9912',
          },]
      }]
  }];
  selectedHost:any = {'title':'', ip:'', port:22,  user:'', pass:''};
  selectedNode:NzTreeNode;
  searchValue = '';

  constructor(private modal: NzModalRef, private nzContextMenuService: NzContextMenuService, private electonService: ElectronService) {}

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
  ngAfterViewInit(): void {
    var strConfig: any= this.electonService.fs.readFileSync('ngTermCfg.json');
    //console.log(strConfig);
    if (strConfig)this.hostlist = [JSON.parse(strConfig)];
    setTimeout(() => {
      this.formatHostList(this.hostlist);
      this.selectedHost = this.hostlist[0];
    })
  }
  destroyModal(): void {
    this.selectedNode = null;
    this.modal.destroy(null);
  }
  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
    this.selectedNode = event.node;
    this.selectedHost = event.node.origin;
  }
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }
  addNode(node: NzTreeNode, type: any){  
    var key = this.keynum++;
    var newNode = new NzTreeNode({title: type+'('+key+')', type: type, isLeaf: true, key: type+key});
    node.isLeaf = false;
    node.isExpanded = true;
    node.addChildren([newNode]);
    newNode.isSelected = true;
    this.selectedHost = newNode.origin;
  }
  deleteNode(node: NzTreeNode){
    var parent: NzTreeNode;
    parent = node.getParentNode()
    node.remove();
    if (parent.children.length == 0){
      parent.isLeaf = true;
    }
  }
  getSelectedHost(node:NzTreeNode, result: any){
    var tmp = node.origin;
    tmp.child = result;
    if (node.parentNode && (node.parentNode.origin.type == 'host' || node.parentNode.origin.type == 'subhost' ))
      return this.getSelectedHost(node.parentNode, tmp);
    else
      return tmp;
  }
  connect(type:string){
    this.modal.destroy({type:type, host:this.getSelectedHost(this.selectedNode, null)});
  }
  @ViewChild('nzTreeComponent', { static: false }) nzTreeComponent!: NzTreeComponent;

  saveCfg(){
    this.electonService.fs.writeFileSync('ngTermCfg.json', JSON.stringify(this.nzTreeComponent.getTreeNodes()[0].origin, null, 4));
  }
  onTitleChange(title:string){
    console.log('aaa:',title);
    if (this.selectedNode){
      setTimeout(() => {
        this.selectedNode.title = title;
      })
    }
  }
}
