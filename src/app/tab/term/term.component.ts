import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, Injector } from '@angular/core';
import { Terminal, ITheme } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { interval, Subscription } from 'rxjs';
import { NotifyService } from '../../service/notify.service';
import { BaseSession, SessionService } from '../../service/session.service';
import { BaseTabComponent } from '../base-tab/base-tab.component';


@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.css']
})
export class TermComponent extends BaseTabComponent implements OnInit, AfterViewInit, OnDestroy {
  private notify: NotifyService;

  fitAddon: any;
  xterm: any;
  xtermCore: any;
  rows:any;
  cols:any;
  recvNewData = false;
  subscription: Subscription;

  constructor(protected injector: Injector) { 
    super(injector.get(SessionService));
    this.notify = injector.get(NotifyService);
  }

  @ViewChild('terminal', {static: true}) terminalDiv:ElementRef;
  
  newTermSession(){
    this.newSession(
      (path) => {
        this.resizeHandler();
      },
      (data) => {
        this.recvNewData = true;
        this.xterm.write(data);
      },
      (error) => {
        this.xterm.write("\r\n\r\n");
        this.xterm.writeln("\x1b[1;1;31mError:"+error+"\x1b[0m");
        this.xterm.writeln("Press CTRL + ENTER to reconnect!!");
      }
    );
  }
  ngOnInit(): void {
    let timer = interval(100);
    timer.subscribe(t => {
      if (this.recvNewData){
        this.onStateChange.emit('DATA');
        this.recvNewData = false;
      }
    })
    this.newTermSession();
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
    this.xterm.onKey((key) => {
      if (this.state == "ERROR"){
        if (key.domEvent.ctrlKey && key.domEvent.keyCode == '13'){
          this.newTermSession();
          this.xterm.clear();
        }
      }
    });
    
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
  ngOnDestroy(): void{
    this.session.kill();
    this.subscription.unsubscribe();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
