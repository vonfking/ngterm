import { Injectable } from '@angular/core';
import {DragDrop} from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root'
})
export class DiagDragDropService {

  constructor(private  dragDrop: DragDrop) { }

  setDragDrop(modalRef: any){
    const dom = modalRef.containerInstance.elementRef.nativeElement;
    const dragModal = this.dragDrop.createDrag(dom.querySelector('.ant-modal-content'));
    const title = dom.querySelector('.ant-modal-header');
    dragModal.withHandles([title]);
    dragModal.withBoundaryElement(document.body);
  }
}
