import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzContextMenuService } from 'ng-zorro-antd/dropdown';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-basic-cfg',
  templateUrl: './basic-cfg.component.html',
  styleUrls: ['./basic-cfg.component.css']
})
export class BasicCfgComponent implements OnInit {

  @Input() host:any;
  @Output() titleChange = new EventEmitter<string>();
  constructor(private modal: NzModalRef, private fb: FormBuilder, private nzContextMenuService: NzContextMenuService) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
      ip: [null, [ Validators.required]],
      port: [null, [Validators.required]],
      user: [null, [Validators.required]],
      pass: [null, [Validators.required]],
    });
  }

  validateForm !: FormGroup;
  submitForm(values:any): void {
    console.log(this.host)
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  }
  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }
  onTitleChange(title){
    //console.log(title);
    this.titleChange.emit(title);
  }
}
