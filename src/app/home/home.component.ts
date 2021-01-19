import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }
  isCollapsed = false;
  @Output() openTab = new EventEmitter<any>();

  ngOnInit(): void {
  }
  openLocalTerm(){
    this.openTab.emit({type:"local"})
  }
}
