const {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  session,
  ipcMain,
  shell,
} = require('electron');
const windowStateKeeper = require('electron-window-state');
const {exec} = require('child_process');
const path = require('path');
const server = require('./server');
const axios = require('axios').default;
const cheerio = require('cheerio');

const setupEvents = require('./installers/setupEvents');

if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
}

let mainWindow;

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 350,
    defaultHeight: 680,
  });
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: 'Twitch Multi Chat',
    icon: path.join(app.getAppPath(), 'icon.ico'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js'),
      nodeIntegration: true,
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL('http://localhost:3000').then((_) => {
    const dataPath = app.isPackaged
      ? path.join(process.resourcesPath, 'ext', 'FrankerFaceZ')
      : path.join(__dirname, './src/ext/FrankerFaceZ');

    session.defaultSession.loadExtension(dataPath, {allowFileAcces: true});
  });
  mainWindow.setMinimumSize(350, 100);
  mainWindowState.manage(mainWindow);
  //mainWindow.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function signInWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 350,
    defaultHeight: 680,
  });
  let subWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: 'Sign In',
    icon: path.join(app.getAppPath(), 'icon.ico'),
  });
  Menu.setApplicationMenu(null);
  subWindow.loadURL('https://twitch.tv/login');
  subWindow.on('closed', function () {
    subWindow = null;
  });
}

ipcMain.handle('user_info', () => {
  return session.defaultSession.cookies
    .get({url: 'https://twitch.tv', name: 'auth-token'})
    .then((c) => {
      if (c.length) {
        return session.defaultSession.cookies
          .get({url: 'https://twitch.tv', name: 'name'})
          .then((c2) => {
            return c2[0].value;
          });
      } else {
        console.log('no cookies');
        return null;
      }
    })
    .catch((err) => console.err(err));
});

ipcMain.on('sign_in', () => {
  signInWindow();
});

ipcMain.on('sign_out', () => {
  session.defaultSession
    .clearStorageData({storages: ['cookies']})
    .then(() => {
      console.log('cookies cleared');
    })
    .catch((err) => {
      console.err('error clearing cookies: ', err);
    });
});

ipcMain.handle('channel_info', (_e, channel) => {
  let info = {streamer: '', category: '', title: '', live: null};
  return new Promise((resolve) => {
    exec(`streamlink --json twitch.tv/${channel}`, (error, stdout, stderr) => {
      if (error || stderr) {
        //if command not found
        if (!error.signal) {
          info.live = false;
          info.streamer = channel;
          info.category = '(Offline)';
          info.title = 'Channel offline';
          resolve(info);
        } else {
          resolve(alternateFetch(channel));
        }
      } else {
        const resp = JSON.parse(stdout);
        if (resp.metadata) {
          //live or hosting
          info.live = true;
          info.streamer = resp.metadata.author;
          info.category = resp.metadata.category;
          info.title = resp.metadata.title;
        } else {
          //offline
          info.live = false;
          info.category = '(Offline)';
          info.title = 'Channel offline';
        }
        resolve(info);
      }
    });
  });
});

function alternateFetch(channel) {
  let info = {streamer: '', title: '', live: true};
  return axios
    .get(`https://twitch.tv/${channel}`)
    .then((res) => {
      const $ = cheerio.load(res.data);
      $('meta').each(function (i, e) {
        if (e.attribs.property === 'og:description') {
          info.title = e.attribs.content;
        } else if (e.attribs.property === 'og:title') {
          const title = e.attribs.content.split(' ');
          info.streamer = title[0];
        }
      });
      return info;
    })
    .catch((err) => {
      console.log(err);
    });
}

ipcMain.on('open_browser', (e, channel) => {
  shell
    .openExternal(`https://twitch.tv/${channel}`)
    .catch((err) => console.err(err));
});

app.on('ready', () => {
  createWindow();
});

//handle links
app.on('browser-window-created', (e, w) => {
  w.webContents.on('will-navigate', (e2, url) => {
    if (url === 'https://www.twitch.tv/?no-reload=true') {
      //close login window on success
      e.preventDefault();
      mainWindow.webContents.send('refresh_user');
      w.close();
    } else if (
      url === 'https://twitch.tv/popout/frankerfacez/chat?ffz-settings'
    ) {
      //ffz settings open internally
    } else {
      //other links open in default browser
      e.preventDefault();
      w.close();
      shell.openExternal(url).catch((err) => console.err(err));
    }
  });
});
