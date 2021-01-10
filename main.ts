import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
const SSHClient = require('ssh2').Client;

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

/*web socket init*/
function webSocketInit(){
  const server = require('http').createServer();

  var io = require('socket.io')(server, {cors: {
      orgin: '*',
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-Width', 'Content-Type', 'Accept'],
      credentials: true
  }})
  var ssh = require('./ssh')
  io.on('connect', ssh);
  
  server.listen({host: '127.0.0.1', port: 9527});
  console.log("start ok")
}
function windowOperation(_win){
  let winStartPosition = {x: 0, y: 0};
  let mouseStartPosition = {x: 0, y: 0};
  let movingInterval = null;

  ipcMain.on('window-move', (events, canMoving) => {
    if (canMoving) {
      const winPosition = _win.getPosition();
      winStartPosition = {x: winPosition[0], y: winPosition[1]};
      mouseStartPosition = screen.getCursorScreenPoint();
      if (movingInterval) {
        clearInterval(movingInterval);
      }
      movingInterval = setInterval(() => {
        const cursorPosition = screen.getCursorScreenPoint();
        const x = winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
        const y = winStartPosition.y + cursorPosition.y - mouseStartPosition.y;
        _win.setPosition(x, y, true);
      }, 20);
    } else {
      clearInterval(movingInterval);
      movingInterval = null;
    }
  })
  ipcMain.on('window-min', (e, args) => {
      _win.minimize();
  })
  ipcMain.on('window-max', (e, args) => {
    if (_win.isMaximized()) {
      _win.unmaximize()
    } else {
      _win.maximize()
    }
  })
  ipcMain.on('window-close', (e, args) => {
    console.log('windowOper', args);
    _win.close();
    app.quit();
  })
}
function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.webContents.openDevTools();
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/ngterm/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  windowOperation(win);
  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
  webSocketInit();
} catch (e) {
  // Catch Error
  // throw e;
}

