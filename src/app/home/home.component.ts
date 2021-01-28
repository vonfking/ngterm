import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NotifyService } from '../service/notify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private notify: NotifyService) { }
  openedFunc = "hostcfg";
  setFunc(func){
    this.openedFunc = func;
  }
  isOpenedFunc(func){
    return this.openedFunc == func;
  }
  
  ngOnInit(): void {
  }
  openLocalTerm(){
    this.notify.emitOpenTab({type:"local",  host: null});
  }
}
