import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { HostConfigService } from '../../../service/config.service';

@Component({
  selector: 'app-hostcard',
  templateUrl: './hostcard.component.html',
  styleUrls: ['./hostcard.component.css']
})
export class HostcardComponent implements OnInit {

  constructor(public hostCfg: HostConfigService, private nzContexMenuService: NzContextMenuService) { }
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContexMenuService.create($event, menu);
  }
  @Input() host: any;
  ngOnInit(): void {
  }
  @Output() hostOperation = new EventEmitter<string>();
  @HostListener('dblclick')
  onDoubleClick(){
    this.hostOperation.emit('dblclick');
  }
  onClickOper(type){
    this.hostOperation.emit(type);
  }
  confirmDelete(){
    this.hostOperation.emit('delete');
  }
  @ViewChild("popConfirm") pop:ElementRef;
  clickDelete(){
    this.pop.nativeElement.click();
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
