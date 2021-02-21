"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var SSHClient = require('ssh2').Client;
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
/*web socket init*/
/*function webSocketInit(){
  const server = require('http').createServer();

  var io = require('socket.io')(server, {cors: {
      orgin: '*',
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-Width', 'Content-Type', 'Accept'],
      credentials: true
  }})
  var ssh = require('./ssh')
  io.on('connect', ssh);
  
  server.listen(0);
  return server.address().port;
}*/
/*window operation*/
function windowOperation(_win) {
    var winStartPosition = { x: 0, y: 0 };
    var mouseStartPosition = { x: 0, y: 0 };
    var movingInterval = null;
    electron_1.ipcMain.on('window-move', function (events, canMoving) {
        if (canMoving) {
            if (_win.isMaximized()) {
                _win.unmaximize();
            }
            var winPosition = _win.getPosition();
            winStartPosition = { x: winPosition[0], y: winPosition[1] };
            mouseStartPosition = electron_1.screen.getCursorScreenPoint();
            if (movingInterval) {
                clearInterval(movingInterval);
            }
            movingInterval = setInterval(function () {
                var cursorPosition = electron_1.screen.getCursorScreenPoint();
                var x = winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
                var y = winStartPosition.y + cursorPosition.y - mouseStartPosition.y;
                _win.setPosition(x, y, true);
            }, 20);
        }
        else {
            clearInterval(movingInterval);
            movingInterval = null;
        }
    });
    electron_1.ipcMain.on('window-min', function (e, args) {
        _win.minimize();
    });
    electron_1.ipcMain.on('window-max', function (e, args) {
        if (_win.isMaximized()) {
            _win.unmaximize();
        }
        else {
            _win.maximize();
        }
    });
    electron_1.ipcMain.on('window-close', function (e, args) {
        //console.log('windowOper', args);
        _win.close();
        electron_1.app.quit();
    });
    electron_1.ipcMain.on('window-open-devtool', function (e, args) {
        win.webContents.openDevTools();
    });
}
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        width: 1000, height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve) ? true : false,
            contextIsolation: false,
            enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
        },
    });
    if (serve) {
        //win.webContents.openDevTools();
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        //win.webContents.openDevTools();
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/ngterm/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    windowOperation(win);
    //win['localPort'] = webSocketInit();
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () { return setTimeout(createWindow, 400); });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map