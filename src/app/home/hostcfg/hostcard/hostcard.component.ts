import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hostcard',
  templateUrl: './hostcard.component.html',
  styleUrls: ['./hostcard.component.css']
})
export class HostcardComponent implements OnInit {

  constructor() { }
  @Input() host: any;
  ngOnInit(): void {
  }

}
