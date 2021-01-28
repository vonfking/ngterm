import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';
import { ElectronService } from '../service/electron.service';

@Directive({
  selector: '[appWinOperation]'
})
export class WinOperationDirective implements AfterViewInit {

  constructor(private el:ElementRef, private electron: ElectronService) { }

  private navElement = [];
  ngAfterViewInit(){
    let tmp = this.el.nativeElement.getElementsByClassName('ant-tabs-nav-wrap');
    if (tmp.length > 0)this.navElement.push(tmp[0]);
    tmp = this.el.nativeElement.getElementsByTagName('nz-tabs-nav');
    if (tmp.length > 0)this.navElement.push(tmp[0]);
    this.navElement.push(this.el.nativeElement);
  }
  isNavEvent(e){
    if (this.navElement.length == 0)
      return true;
    for (let element of this.navElement) {
      if (e.srcElement == element)
        return true;
    }
    return false;
  }
  @HostListener('mousedown', ['$event'])
  onMouseDown(e){
    if (this.isNavEvent(e)) this.electron.ipcRenderer.send('window-move', true);
  }
  @HostListener('mouseup', ['$event'])
  onMouseUp(e){
    if (this.isNavEvent(e)) this.electron.ipcRenderer.send('window-move', false);
  }
  @HostListener('dblclick', ['$event'])
  onDoubleClick(e){
    if (this.isNavEvent(e)) this.electron.ipcRenderer.send('window-max');
  }
}
