import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HostcfgComponent } from './hostcfg/hostcfg.component';
import { DiagDragDropService } from './service/diag-drag-drop.service';
import { ElectronService } from './service/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  isCollapsed = true;
  tablist = [];
  selectedIndex = 0;

  constructor(private modal: NzModalService, 
    private viewContainerRef: ViewContainerRef, 
    private diagDragDrop: DiagDragDropService, 
    private electron: ElectronService,
    private cd: ChangeDetectorRef) {}
  
  ngOnInit(){
    document.addEventListener('contextmenu',function(e){
      e.preventDefault();
    })
  }
  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  closeTab({index}: {index: number}): void {
    this.tablist.splice(index - 1, 1);
  }
  newTab(): void{
    const modal = this.modal.create({
      nzTitle: 'Hosts Configuration',
      nzWidth: '800px',
      nzContent: HostcfgComponent,
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
      if (result){
        if (result.type=='ssh')
          result.icon = 'apple';
        else
          result.icon = 'android';
        this.tablist.push(result);
        this.selectedIndex = this.tablist.length;  
      }
    });
    
  }

  getTitle(host: any){
    if (host.child){
      return this.getTitle(host.child);
    }else{
      return host.ip;
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
}
