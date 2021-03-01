import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, Injector } from '@angular/core';
import { Terminal, ITheme } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { interval, Subscription } from 'rxjs';
import { NotifyService } from '../../service/notify.service';
import { BaseSession, SessionService } from '../../service/session.service';
import { BaseTabComponent } from '../base-tab/base-tab.component';

@Component({
  selector: 'app-base-term-tab',
  templateUrl: './base-term-tab.component.html',
  styleUrls: ['./base-term-tab.component.css']
})
export class BaseTermTabComponent extends BaseTabComponent implements OnInit {

  private notify: NotifyService;

  fitAddon: any;
  xterm: any;
  xtermCore: any;
  recvNewData = false;
  subscription: Subscription;

  constructor(protected injector: Injector) { 
    super(injector.get(SessionService));
    this.notify = injector.get(NotifyService);
    let timer = interval(100);
    timer.subscribe(t => {
      if (this.recvNewData){
        this.onStateChange.emit('DATA');
        this.recvNewData = false;
      }
    })
  }

  @ViewChild('terminal', {static: true}) terminalDiv:ElementRef;
  
  ngOnInit(): void {
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
    this.xterm.setOption('theme', theme);
    this.xterm.setOption('fontFamily', "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace")
    this.xtermCore = (this.xterm as any)._core;
    
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
