import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TouchBarSlider } from 'electron';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { fromEvent, Subscription } from 'rxjs';
import { NotifyService } from 'src/app/service/notify.service';

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit, OnDestroy,AfterViewChecked, AfterViewInit {

  @Input() listType:string;
  @Input() path:string;
  @Input() files:any[];
  @Input() isSpinning:boolean;
  @Output() pathChange = new EventEmitter<any>();
  @Output() fileOper = new EventEmitter<any>();

  allChecked = false;
  indeterminate = false;
  tableSize: any = {x: '100px', y: '100px'};
  nameWidth = '300px';
  subscription: Subscription;

  constructor(private notify: NotifyService, private nzContexMenuService: NzContextMenuService, private message: NzMessageService) { }
  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContexMenuService.create($event, menu);
  }

  //@ViewChild('nzTable') nzTableComponent: any;//NzTableComponent<any>;
  @ViewChild('nzTable') nzTableComponent: any;//NzTableComponent<any>;
  setTableSize(){
    let tabWidth = this.nzTableComponent.elementRef.nativeElement.parentNode.clientWidth - 4 - 10;//- padding - scoll-bar-width
    let tabHeight= this.nzTableComponent.elementRef.nativeElement.parentNode.clientHeight- 32- 39;//- filelist-header - table-header
    let nameWidth= tabWidth - 30 - 30 - 100 - 160;
    if (nameWidth < 100)nameWidth = 100;
    this.nameWidth = nameWidth + 'px';
    this.tableSize = {
      x: (tabWidth)+'px', 
      y: (tabHeight)+'px'    
    };
    let el_table_body = this.nzTableComponent.elementRef.nativeElement.getElementsByClassName('ant-table-body');
    if (el_table_body && el_table_body.length > 0){
      el_table_body[0].style.height = tabHeight + 'px';
    }
  }
  
  ngOnInit(): void {
    fromEvent(window, 'resize').subscribe((event)=>{
      this.setTableSize();
    })
    this.subscription = this.notify.onSftpWindowChange(() => {
      this.setTableSize();
    })
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
  ngAfterViewInit(){
    setTimeout(() => this.setTableSize());
  }
  ngAfterViewChecked(){    
    //setTimeout(()=>{this.checkCheckBoxChanged()}, 0);
    //setTimeout(()=>{this.setTableSize()}, 0);
  }

  dblClick(type:string, name:string){
    if (type == 'd'){
      console.log('dblclick', type, name);
      this.filenameReset();
      this.pathChange.emit({type:'relative', path:name});
    }
  }
  onRefresh(){
    console.log('refresh', this.path);
    this.filenameReset();
    this.pathChange.emit({type:'absolute', path:this.path});
  }
  onUpdir(){
    this.filenameReset();
    this.pathChange.emit({type:'relative', path:'..'});
  }
  onFileBatchOper(type){
    let fileList = [];
    this.files.forEach((file) => {
      if (file.checked){
        fileList.push({type:file.type, name:file.name});
      }
    })
    this.filenameReset();
    if (fileList.length == 0){
      this.message.create('error', 'No File selected!');
      return;
    }
    this.fileOper.emit({type:type, fileList:fileList});
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
    this.checkCheckBoxChanged();
  }
  checkOne(file, checked: boolean){
    file.checked = checked;
    this.checkCheckBoxChanged();
  }
  /* rename */
  private oldFileName: string;
  private editIndex: number;
  rename(index, filename){
    this.oldFileName = filename;
    this.editIndex = index;
  }
  isEditable(index){
    return index === this.editIndex;
  }
  filenameReset(){
    let i = this.editIndex;
    this.editIndex = -1;
    if (i == -1)return;
    this.files[i] = this.oldFileName;
  }
  filenameChanged(e){
    var evt = window.event || e;
    if (evt.keyCode == 13){ //Enter
      for( let i =0; i <  this.files.length; i++){
        if (i != this.editIndex && this.files[i].name == this.oldFileName){
          this.message.create('error', 'File Name duplicated!');
          return;
        }
      }
      this.fileOper.emit({type:'rename', oldname:this.oldFileName, newname: this.files[this.editIndex].name});
      this.editIndex = -1;
    }else if (evt.keyCode == 27){ //ESC
      this.filenameReset();
    }
  }
}
