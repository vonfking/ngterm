import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit, AfterViewChecked {

  @Input() listType:string;
  @Input() path:string;
  @Input() files:any[];
  @Input() isSpinning:boolean;
  @Output() pathChange = new EventEmitter<any>();
  
  allChecked = false;
  indeterminate = false;
  tableSize: any = {x: '100px', y: '100px'};
  constructor() { }

  //@ViewChild('nzTable') nzTableComponent: any;//NzTableComponent<any>;
  @ViewChild('nzTable') nzTableComponent: any;//NzTableComponent<any>;
  setTableSize(){
    this.tableSize = {
      x: (this.nzTableComponent.elementRef.nativeElement.parentNode.clientWidth - 4 - 10)+'px', //- padding - scoll-bar-width
      y: (this.nzTableComponent.elementRef.nativeElement.parentNode.clientHeight-32-39)+'px'    //- filelist-header - table-header
    };
  }
  
  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe((event)=>{
      this.setTableSize();
    })
    
  }
  ngAfterViewChecked(){    
    //setTimeout(()=>{this.checkCheckBoxChanged()}, 0);
    //setTimeout(()=>{this.setTableSize()}, 0);
  }

  dblClick(type:string, name:string){
    if (type == 'd'){
      console.log('dblclick', type, name);
      this.pathChange.emit({type:'relative', path:name})
    }
  }
  onRefresh(){
    console.log('refresh', this.path);
    this.pathChange.emit({type:'absolute', path:this.path})
  }
  onUpdir(){
    this.pathChange.emit({type:'relative', path:'..'})
  }
  inputChanged(e){
    var evt = window.event || e;
    if (evt.keyCode == 13){
      console.log('enter pressed');
      this.onRefresh();
    }
  }
  
  typeSortFn = (a:any, b:any) => a.type.localeCompare(b.type);
  nameSortFn = (a:any, b:any) => a.name.localeCompare(b.name);
  sizeSortFn = (a:any, b:any) => a.size - b.size;
  timeSortFn = (a:any, b:any) => a.mtime.localeCompare(b.mtime);

  checkCheckBoxChanged(): void{
    const allUnChecked = this.files.every(file => file.checked === false); 
    this.allChecked = this.files.every(file => file.checked === true);
    this.indeterminate = !allUnChecked && !this.allChecked;
  }
  checkAll(value:boolean):void{
    this.files.forEach(file => {
      file.checked = value;
    })
  }
}
