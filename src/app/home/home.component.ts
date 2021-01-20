import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }
  openedFunc = "hostcfg";
  setFunc(func){
    this.openedFunc = func;
  }
  isOpenedFunc(func){
    return this.openedFunc == func;
  }
  @Output() openTab = new EventEmitter<any>();

  ngOnInit(): void {
  }
  openLocalTerm(){
    this.openTab.emit({type:"local"})
  }
}
