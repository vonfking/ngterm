import { Directive, HostListener } from '@angular/core';
import { ElectronService } from '../service/electron.service';

@Directive({
  selector: '[appWinOperation]'
})
export class WinOperationDirective {

  constructor(private electron: ElectronService) { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e){
    this.electron.ipcRenderer.send('window-move', true);
  }
  @HostListener('mouseup', ['$event'])
  onMouseUp(e){
    this.electron.ipcRenderer.send('window-move', false);
  }
  @HostListener('dblclick', ['$event'])
  onDoubleClick(e){
    this.electron.ipcRenderer.send('window-max');
  }
}
