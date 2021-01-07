import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appResizeTableCol]'
})
export class ResizeTableColDirective implements AfterViewInit{

  cols: any[];
  mouseDown = false;
  oldX = 0;
  oldWidth = 0;
  elResizing :any;

  constructor(private el:ElementRef) { }
  ngAfterViewInit(){
    this.cols = this.el.nativeElement.getElementsByTagName('th');
  }
  canResize(e:any){
    for(let i =0; i<this.cols.length - 1; i++){
      let offset = this.cols[i].offsetWidth;
      if (e.srcElement == this.cols[i] && e.offsetX > offset -10 && e.offsetX < offset){
        this.el.nativeElement.style.cursor = 'col-resize';
        return true;
      }
    }
    return false;
  }
  @HostListener('mousedown', ['$event'])
  onMouseDown(e){
    if (this.canResize(e)){
      this.mouseDown = true;
      this.oldX = e.x;
      this.oldWidth = e.srcElement.offsetWidth;
      this.elResizing = e.srcElement;
    }
  }
  @HostListener('mouseup', ['$event'])
  onMouseUp(e){
    if (this.mouseDown){
      this.mouseDown = false;
      this.el.nativeElement.style.cursor = 'default';
    }
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(e){
    if (this.canResize(e)){
      this.el.nativeElement.style.cursor = 'col-resize';
    }else{
      this.el.nativeElement.style.cursor = 'default';
    }
    if (this.mouseDown){
      this.elResizing.style.width = this.oldWidth + e.x - this.oldX + 'px';
      e.preventDefault();
    }
  }
}
