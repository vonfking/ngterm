import { Component, Injector, OnInit } from '@angular/core';
import { BaseTermTabComponent } from '../base-term-tab/base-term-tab.component';

@Component({
  selector: 'app-forward',
  templateUrl: './forward.component.html',
  styleUrls: ['./forward.component.css']
})
export class ForwardComponent extends BaseTermTabComponent implements OnInit {

  constructor(protected injector: Injector) { 
    super(injector);
  }

  newForwardSession(){
    this.newSession(
      (host) => {
        this.xterm.writeln(`Forwording is working.`);
        this.xterm.writeln(`IP:${host.ip}, Port:${host.port}, LocalPort: ${host.localPort}\r\n`);
      },
      (data) => {
        this.recvNewData = true;
        this.xterm.writeln(`new connection,  IP:${data.ip}, Port:${data.port}`);
      },
      (error) => { 
        this.xterm.write("\r\n\r\n");
        this.xterm.writeln("\x1b[1;1;31mError:"+error+"\x1b[0m");
      }
    );
  }
  ngOnInit(): void {
    this.newForwardSession();
  }
  
}
