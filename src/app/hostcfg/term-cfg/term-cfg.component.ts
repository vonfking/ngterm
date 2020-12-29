import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-term-cfg',
  templateUrl: './term-cfg.component.html',
  styleUrls: ['./term-cfg.component.css']
})
export class TermCfgComponent implements OnInit {

  @Input() host:any;
  constructor() { }

  ngOnInit(): void {
  }

}
