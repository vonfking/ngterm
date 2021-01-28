import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote, BrowserWindow } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  app: Electron.App;
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  BrowserWindow: typeof BrowserWindow;
  screen: Electron.Screen;
  childProcess: typeof childProcess;
  fs: typeof fs;
  path: typeof path;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.BrowserWindow = this.remote.BrowserWindow;
      this.screen = this.remote.screen;
      this.app = this.remote.app;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.path = window.require('path');
    }
  }
  getLocalPort(){
    let win: any =  this.BrowserWindow.getFocusedWindow();
    return win.localPort;
  }
  isWindowMax(){
    return this.BrowserWindow.getFocusedWindow().isMaximized();
  }
}
