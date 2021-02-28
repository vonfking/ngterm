import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Host } from '../../service/config.service';
import { BaseSession, SessionService } from '../../service/session.service';

@Component({
  selector: 'app-base-tab',
  templateUrl: './base-tab.component.html',
  styleUrls: ['./base-tab.component.css']
})
export class BaseTabComponent implements OnInit {

  session: BaseSession;
  @Input() host: Host;
  @Input() tabIndex: number;
  @Input() type: string;
  @Output() onStateChange = new EventEmitter<string>();
  state:"CONNECTING"| "CONNECTED" | "ERROR";
  newSession(onOpen, onData, onError){
    this.state = "CONNECTING";
    this.onStateChange.emit('CONNECTING');
    this.session = this.sessionService.newSession(this.type, this.host);
    this.session.opened$.subscribe((path:any)=>{
      console.log("recv CONNECTED")
      this.state = "CONNECTED";
      this.onStateChange.emit('CONNECTED');
      if (onOpen)onOpen(path);
    })
    this.session.output$.subscribe(data=>{
      console.log("recv data")
      if (onData)onData(data);
    })
    this.session.error$.subscribe(error=>{
      console.log("recv ERROR")
      this.session.kill();
      this.state = "ERROR"
      this.onStateChange.emit('ERROR');
      if (onError)onError(error);
    })
  }
  constructor(protected sessionService: SessionService) { }

  ngOnInit(): void {

  }

}
