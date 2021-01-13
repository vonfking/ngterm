import { ThrowStmt } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgTerminal, DisplayOption } from 'ng-terminal';
import { Socket, SocketService } from '../service/socket.service';
import { Terminal, ITheme } from "xterm";
import { ElectronService } from '../service/electron.service';
import { FitAddon } from 'xterm-addon-fit';


@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.css']
})
export class TermComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  socket: Socket;
  sshClient: any;
  host: any;
  fitAddon: any;
  xterm: any;
  xtermCore: any;
  rows:any;
  cols:any;
  
  @Input('hostInfo')
  set _hostInfo(hostinfo: any){
    this.host = hostinfo;
  }
  constructor(private socketService: SocketService, private electron: ElectronService) { this.socket = socketService.newSocket(); }

  @ViewChild('terminal', {static: true}) terminalDiv:ElementRef;
  
  ngOnInit(): void {
    /*this.xtermDataSource = new Observable(observer => {  
      
      this.electron.ipcRenderer.send('SSH', {
        host: '192.168.3.135',
        port: 22,
        username: 'ubuntu',
        password: 'vonf99'
      });
      this.electron.ipcRenderer.on('DATA', (e, data)=>{
        observer.next(data);  
      });
      
      
    });*/
  }
  ngAfterViewInit(): void {
    const theme: ITheme = {
      foreground: '#08cc6f',
      selection: '#0a714e',
      background: '#000000',
      //cursor: config.terminal.colorScheme.cursor,
    }
    window.addEventListener('resize', this.resizeHandler);
    this.fitAddon = new FitAddon();
    this.xterm = new Terminal();
    this.xterm.loadAddon(this.fitAddon);
    this.xterm.open(this.terminalDiv.nativeElement);
    //this.fitAddon.fit();
    this.xterm.setOption('theme', theme);
    this.xterm.setOption('fontFamily', "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace")
    this.xtermCore = (this.xterm as any)._core;
    
    this.socket.connect(this.host, 'ssh').subscribe((value: any) => {
      if (value.key == 'ssh-conn-ack'){
        this.resizeHandler();
        this.xterm.onData((input) => {
          this.socket.sendMsg(input);
         });
      }else{
        this.xterm.write(value.data);
      }
    });
    setTimeout(() => this.xterm.focus());
  }
  resizeHandler = () => {
    try {
        if (this.xterm.element && getComputedStyle(this.xterm.element).getPropertyValue('height') !== 'auto') {
            let t = window.getComputedStyle(this.xterm.element.parentElement!)
            let r = parseInt(t.getPropertyValue('height'))
            let n = Math.max(0, parseInt(t.getPropertyValue('width')))
            let o = window.getComputedStyle(this.xterm.element)
            let i = r - (parseInt(o.getPropertyValue('padding-top')) + parseInt(o.getPropertyValue('padding-bottom')))
            let l = n - (parseInt(o.getPropertyValue('padding-right')) + parseInt(o.getPropertyValue('padding-left'))) - this.xtermCore.viewport.scrollBarWidth
            let actualCellWidth = this.xtermCore._renderService.dimensions.actualCellWidth || 9
            let actualCellHeight = this.xtermCore._renderService.dimensions.actualCellHeight || 17
            let cols = Math.floor(l / actualCellWidth)
            let rows = Math.floor(i / actualCellHeight)

            if (!isNaN(cols) && !isNaN(rows)) {
                this.xterm.resize(cols, rows)
                this.socket.resize(rows, cols);
            }
        }
    } catch (e) {
        // tends to throw when element wasn't shown yet
        console.warn('Could not resize xterm', e)
    }
  }
  ngAfterViewChecked(): void {
    //let dims = this.fitAddon.proposeDimensions();
    /*
    if (isNaN(dims.rows) || dims.rows == Infinity || isNaN(dims.cols) || dims.cols == Infinity) {
        this.xterm.resize(10, 10);
    }
    else {
        this.fitAddon.fit();
    }
    //this.fitAddon.fit();
    if (this.rows != this.xterm.rows || this.cols != this.xterm.cols){
      this.rows = this.xterm.rows;
      this.cols = this.xterm.cols;
      this.socket.resize(this.rows, this.cols);
    }
    this.xterm.focus();*/
    //let a = this.terminalDiv.nativeElement;
    //console.log(a.style.zIndex)
  }
  ngOnDestroy(): void{
    this.socket.disconnect();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
