import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  constructor() { }
  /** sftp window size change */
  private sftpWindow = new Subject();
  emitSftpWindowChange(){
    this.sftpWindow.next();
  }
  onSftpWindowChange(cb){
    return this.sftpWindow.asObservable().subscribe(() => cb());
  }
  /** main tab index change */
  private mainTabIndex = new Subject();
  emitMainTabIndexChange(tabIndex: number){
    this.mainTabIndex.next(tabIndex);
  }
  onMainTabIndexChange(cb){
    return this.mainTabIndex.asObservable().subscribe(index => cb(index));
  }
  /** main tab index change */
  private openTab = new Subject();
  emitOpenTab(tab: {type:string, host: any}){
    this.openTab.next(tab);
  }
  onOpenTab(cb){
    return this.openTab.asObservable().subscribe(tab => cb(tab));
  }
}
