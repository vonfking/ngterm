import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SessionService } from '../../service/session.service';
import { BaseTabComponent } from '../base-tab/base-tab.component';

@Component({
  selector: 'app-forward',
  templateUrl: './forward.component.html',
  styleUrls: ['./forward.component.css']
})
export class ForwardComponent extends BaseTabComponent implements OnInit, OnDestroy {

  constructor(protected injector: Injector) { 
    super(injector.get(SessionService));
  }

  message:string;
  newForwardSession(){
    this.newSession(
      (path) => { },
      (data) => { },
      (error) => { this.message = error; }
    );
  }
  ngOnInit(): void {
    this.newForwardSession();
  }
  ngOnDestroy(): void{
    this.session.kill();
  }
}
