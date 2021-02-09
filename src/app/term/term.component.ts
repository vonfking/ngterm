import { AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Socket, SocketService } from '../service/socket.service';
import { Terminal, ITheme } from "xterm";
import { ElectronService } from '../service/electron.service';
import { FitAddon } from 'xterm-addon-fit';
import { interval, Subscription } from 'rxjs';
import { NotifyService } from '../service/notify.service';
import { BaseSession, SessionService } from '../service/session.service';


@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.css']
})
export class TermComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  host: any;
  fitAddon: any;
  xterm: any;
  xtermCore: any;
  rows:any;
  cols:any;
  recvNewData = false;
  subscription: Subscription;
  session: BaseSession;
  
  @Input('hostInfo')
  set _hostInfo(hostinfo: any){
    this.host = hostinfo;
  }
  @Input() tabIndex: number;
  @Input() termType: string;
  @Output() onNewData = new EventEmitter<any>();
  constructor(private notify: NotifyService, private sessionService: SessionService, private electron: ElectronService) { 
  }

  @ViewChild('terminal', {static: true}) terminalDiv:ElementRef;
  
  ngOnInit(): void {
    let timer = interval(100);
    this.session = this.sessionService.newSession(this.termType, this.host);
    timer.subscribe(t => {
      if (this.recvNewData){
        this.onNewData.emit();
        this.recvNewData = false;
      }
    })
  }
  ngAfterViewInit(): void {
    const theme: ITheme = {
      foreground: '#08cc6f',
      selection: '#0a714e',
      background: '#000000',
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
    this.xterm.onData((input) => {
      this.session.write(input);
    });
    this.session.output$.subscribe(data=>{
      this.xterm.write(data);
    })
    this.session.opened$.subscribe(()=>{
      this.resizeHandler();
    })
    setTimeout(() => this.xterm.focus());
    this.subscription = this.notify.onMainTabIndexChange((index) => {
      if (index == this.tabIndex) {
        this.resizeHandler();
        this.xterm.focus();
      }
    })
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
            let actualCellWidth = this.xtermCore._renderService.dimensions.actualCellWidth || 8
            let actualCellHeight = this.xtermCore._renderService.dimensions.actualCellHeight || 18
            let cols = Math.floor(l / actualCellWidth)
            let rows = Math.floor(i / actualCellHeight)

            if (!isNaN(cols) && !isNaN(rows)) {
                this.xterm.resize(cols, rows)
                this.session.resize(cols, rows);
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
    this.session.kill();
    this.subscription.unsubscribe();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
