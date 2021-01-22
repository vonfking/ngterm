import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HostcfgComponent2 } from './hostcfg/hostcfg.component';
import { ConfigService } from './service/config.service';
import { DiagDragDropService } from './service/diag-drag-drop.service';
import { ElectronService } from './service/electron.service';
import { NotifyService } from './service/notify.service';

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
    private electron: ElectronService,
    private cd: ChangeDetectorRef,
    private nzContexMenuService: NzContextMenuService,
    private notify: NotifyService, 
    private config: ConfigService) {}
  
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContexMenuService.create($event, menu);
  }
  
  ngOnInit(){
    document.addEventListener('contextmenu',function(e){
      e.preventDefault();
    })
  }
  ngOnDestroy(){
    this.tablist = [];
  }
  ngAfterViewInit() {
    this.cd.detectChanges();
    this.config.onNewTab(tab => {
      this.addTab(tab);
    })
  }
  getIconByType(type){
    return type == 'ssh' ? 'code' : (type == 'sftp' ? 'read' : 'windows');
  }
  getOriginTitle(host: any){
    if (host == null) return 'Local Terminal';
    if (host.child){
      return this.getOriginTitle(host.child);
    }else{
      return host.ip;
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
        if (tab.title != this.getInitalTitle(tab.origin_title, tab.title_index)){
          return tab.index;
        }
        used_index[tab.title_index] = true;
        index += 1;
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
      dot  : false,
      host : tab.host,
      icon : this.getIconByType(tab.type),
      origin_title: origin_title,
      title_index: title_index,
      title: this.getInitalTitle(origin_title, title_index)
    }
    this.tablist.push(newTab);
    this.selectedIndex = this.tablist.length;
  }
  newTab(): void{
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
    });
  }
  dupTab(tab, type){
    this.addTab({type: type, host: tab.host});
  }
  newLocalShell(){
    this.addTab({type: 'local', host: null});
  }
  onTabRecvNewData(index){
    if (this.selectedIndex != index + 1){
      this.tablist[index].dot = true;
    }
  }
  onSelectTabChange(index){
    if (index > 0){
      this.tablist[index - 1].dot = false;
      this.notify.emitMainTabIndexChange(index - 1);
    }
  }
  windowOper(oper:string){
    console.log(oper);
    this.electron.ipcRenderer.send(oper);
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    console.log(event.keyCode, event.key)
    if (event.ctrlKey && event.keyCode == 9) {
      this.selectedIndex += 1;
      this.selectedIndex %= this.tablist.length + 1;
    }else if (event.ctrlKey && event.keyCode >= 49 && event.keyCode <= 57 && event.keyCode-49<=this.tablist.length){
      this.selectedIndex = event.keyCode-49;
    }
  }
  @ViewChildren('popOrigin', {read: ElementRef}) popOriginList: QueryList<ElementRef>;
  getPopOrigin(i): ElementRef{
    return this.popOriginList.toArray()[i];
  }
}
