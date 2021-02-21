import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Host, HostConfigService } from './service/config.service';
import { DiagDragDropService } from './service/diag-drag-drop.service';
import { ElectronService } from './service/electron.service';
import { NotifyService } from './service/notify.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NotifyService]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit{
  isCollapsed = true;
  tablist = [];
  selectedIndex = 0;

  constructor(private modal: NzModalService, 
    private viewContainerRef: ViewContainerRef, 
    private diagDragDrop: DiagDragDropService, 
    public  electron: ElectronService,
    private cd: ChangeDetectorRef,
    private nzContexMenuService: NzContextMenuService,
    private notify: NotifyService, 
    private hostCfg: HostConfigService) {}
  
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContexMenuService.create($event, menu);
  }
  
  ngOnInit(){
    document.addEventListener('contextmenu',function(e){
      e.preventDefault();
    })
    this.notify.onOpenTab(tab => {
      if (tab.type == 'local')this.newLocalShell();
      else this.addTab(tab);
    })
  }
  ngOnDestroy(){
    this.tablist = [];
  }
  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  getOriginTitle(host: Host){
    if (host == null) return 'Local Terminal';
    if (host.child){
      return this.getOriginTitle(host.child);
    }else{
      return host.title;
    }
  }
  getInitalTitle(title, index){
    if (index == 0) return title;
    else return title + '(' + index + ')';
  }
  getTitleIndex(type, origin_title): number {
    let index = 0;
    let used_index = {};
    for (let i = 0; i < this.tablist.length; i++){
      let tab = this.tablist[i];
      if (tab.origin_title == origin_title && tab.type == type){
        if (tab.title == this.getInitalTitle(tab.origin_title, tab.title_index)){
          used_index[tab.title_index] = true;
          index += 1;
        }
      }
    }
    for (let i=0; i< index; i++){
      if (!used_index[i])
        return i;
    }
    return index;
  }
  closeTab({index}: {index: number}): void {
    this.tablist.splice(index - 1, 1);
  }
  addTab(tab: {type:string, host:any}){
    let origin_title = this.getOriginTitle(tab.host);
    let title_index  = this.getTitleIndex(tab.type, origin_title);
    let newTab = {
      type : tab.type,
      showChange  : false,
      showError  : false,
      host : tab.host,
      icon : this.hostCfg.getIconByType(tab.type),
      origin_title: origin_title,
      title_index: title_index,
      title: this.getInitalTitle(origin_title, title_index)
    }
    this.tablist.push(newTab);
    setTimeout(() => {
      this.selectedIndex = this.tablist.length;
      //this.notify.emitMainTabIndexChange(this.selectedIndex - 1);
    });
  }
  newTab(): void{
    /*
    const modal = this.modal.create({
      nzTitle: 'Hosts Configuration',
      nzWidth: '800px',
      nzContent: HostcfgComponent2,
      nzMaskClosable: false,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        title: 'title in component',
        subtitle: 'component sub title，will be changed after 2 sec'
      },
      nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      nzFooter: null
    });
    const instance = modal.getContentComponent();
    modal.afterOpen.subscribe(() => this.diagDragDrop.setDragDrop(modal));
    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result)this.addTab(result);
    });*/
  }
  dupTab(tab, type){
    this.addTab({type: type, host: tab.host});
  }
  newLocalShell(){
    this.addTab({type: 'local', host: null});
  }
  onTabStateChange(index, msg){
    if (msg == 'CONNECTING'){
      this.tablist[index].isLoading = true;
      this.tablist[index].showError = false;
      this.tablist[index].showChange = false;
    }else{
      this.tablist[index].isLoading = false;
    }
    if (msg == 'ERROR'){
      this.tablist[index].showError = true;
      this.tablist[index].showChange = false;
    }
    else if (this.selectedIndex != index + 1){
      this.tablist[index].showError = false;
      this.tablist[index].showChange = true;
    }
  }
  onSelectTabChange(index){
    if (index > 0){
      this.tablist[index - 1].showChange = false;
      this.notify.emitMainTabIndexChange(index - 1);
    }
  }
  windowOper(oper:string){
    console.log(oper);
    this.electron.ipcRenderer.send(oper);
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    //console.log(event.keyCode, event.key)
    if (event.ctrlKey && event.keyCode == 9) {
      this.selectedIndex += 1;
      this.selectedIndex %= this.tablist.length + 1;
    }else if (event.ctrlKey && event.keyCode >= 49 && event.keyCode <= 57 && event.keyCode-49<=this.tablist.length){
      this.selectedIndex = event.keyCode-49;
    }
  }
  @ViewChildren("popRename", {read: ElementRef}) pop: QueryList<ElementRef>;
  newTitle: string;
  renameTitle(index){
    this.newTitle = this.tablist[index].title;
    this.pop.toArray()[index].nativeElement.click();
  }
  confirmRename(index){
    this.tablist[index].title = this.newTitle;
  }


  /* tree view */
  isTreeViewOpened = false;
  isGroupSelected = true;
  selectedHost: Host;
  private transformer = (host: Host, level: number) => {
    return {
      expandable: !!host.children && host.children.length > 0,
      name: host.title,
      level: level,
      host: host
    };
  };
  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  treeControl  = new FlatTreeControl<any>(
    node => node.level,
    node => node.expandable
  );
  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);
  selectListSelection= new SelectionModel<any>(true);
  showTreeView(show){
    if (show){
    this.dataSource.setData(this.hostCfg.getHostConfig().children);
    this.treeControl.expandAll();
    this.isTreeViewOpened = true;
    }
    else{
      this.isTreeViewOpened = false;
    }
  }
  clickTreeNode(node){
    let nodes = this.dataSource._flattenedData.value;
    this.selectedHost = node.host;
    this.isGroupSelected = this.hostCfg.isGroup(node.host);
    for (let i=0; i<nodes.length; i++){
      if (nodes[i] == node){
        if (!this.selectListSelection.isSelected(nodes[i]))this.selectListSelection.toggle(nodes[i]);
      }
      else{
        if (this.selectListSelection.isSelected(nodes[i]))this.selectListSelection.toggle(nodes[i]);
      }
    }
  }
  confirmTreeNode(type){
    this.isTreeViewOpened = false;
    this.notify.emitOpenTab({type: type, host: this.hostCfg.getConnectHost(this.selectedHost)});
    //this.addTab({type:type, host:this.selectedHost});
  }
  isHost = (_: number, node: any) => this.hostCfg.isHost(node.host) && node.host.children && node.host.children.length > 0;
  isGroup= (_: number, node: any) => this.hostCfg.isGroup(node.host);
}
