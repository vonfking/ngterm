import { AfterViewInit, Component, OnInit, Injector } from '@angular/core';
import { BaseTermTabComponent } from '../base-term-tab/base-term-tab.component';


@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.css']
})
export class TermComponent extends BaseTermTabComponent implements OnInit, AfterViewInit {
  constructor(protected injector: Injector) { 
    super(injector); 
  }  
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
    this.newTermSession();
  }
  ngAfterViewInit(): void {
    super.ngAfterViewInit();
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
  }
}
