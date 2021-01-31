import { Component, OnInit } from '@angular/core';
import { Setting, SettingService } from '../../service/config.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  constructor(public settingSvc: SettingService) { }

  setting: Setting;
  ngOnInit(): void {
    this.setting = this.settingSvc.getConfig();
  }

}
