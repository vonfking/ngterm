import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appResizeOneCol]'
})
export class ResizeOneColDirective {

  constructor(private el:ElementRef) { }
  @HostListener('mousemove', ['$event'])
  onMouseMove(e){
    if (e.offsetX > this.el.nativeElement.offsetWidth - 10){
      this.el.nativeElement.style.cursor = 'col-resize';
    }else{
      this.el.nativeElement.style.cursor = 'default';
    }
  }
}
