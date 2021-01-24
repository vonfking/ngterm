import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { TermComponent } from './term/term.component';
import { NgTerminalModule } from 'ng-terminal';
import { AngularSplitModule } from 'angular-split';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { HostcfgComponent2 } from './hostcfg/hostcfg.component';
import { BasicCfgComponent } from './hostcfg/basic-cfg/basic-cfg.component';
import { TermCfgComponent } from './hostcfg/term-cfg/term-cfg.component';
import { SftpComponent } from './sftp/sftp.component';
import { FilelistComponent } from './sftp/filelist/filelist.component';
import { ResizeTableColDirective } from './directive/resize-table-col.directive';
import { ResizeOneColDirective } from './directive/resize-one-col.directive';
import { WinOperationDirective } from './directive/win-operation.directive';
import { HomeComponent } from './home/home.component';
import { SettingComponent } from './home/setting/setting.component';
import { HistoryComponent } from './home/history/history.component';
import { HostcfgComponent } from './home/hostcfg/hostcfg.component';
import { HostcardComponent } from './home/hostcfg/hostcard/hostcard.component';
registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TermComponent,
    HostcfgComponent,
    HostcfgComponent2,
    BasicCfgComponent,
    TermCfgComponent,
    SftpComponent,
    FilelistComponent,
    ResizeTableColDirective,
    ResizeOneColDirective,
    WinOperationDirective,
    HistoryComponent,
    HomeComponent,
    SettingComponent,
    HostcardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgTerminalModule,
    AngularSplitModule,
    NzLayoutModule, NzIconModule, NzMenuModule, NzTabsModule, NzModalModule, NzTreeModule, NzSpinModule,
    NzFormModule, NzDropDownModule, NzInputModule, NzDividerModule, NzButtonModule, NzTableModule,
    NzMessageModule, NzCardModule, NzBadgeModule, NzPopconfirmModule, NzBreadCrumbModule, NzPageHeaderModule,
    NzAvatarModule, NzDrawerModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule { }
