import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ConfigService } from '../../../service/config.service';

@Component({
  selector: 'app-hostcard',
  templateUrl: './hostcard.component.html',
  styleUrls: ['./hostcard.component.css']
})
export class HostcardComponent implements OnInit {

  constructor(public config: ConfigService) { }
  @Input() host: any;
  ngOnInit(): void {
  }
  showOperBtn = false;
  @HostListener('mouseenter')
  onMouseEnter(){
    this.showOperBtn = true;
  }
  @HostListener('mouseleave')
  onMouseLeave(){
    this.showOperBtn = false;
  }
  isVisible = false;
  visibleChange(visible){
    this.isVisible = visible;
  }
}
