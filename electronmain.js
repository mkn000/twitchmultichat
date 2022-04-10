const {app, BrowserWindow, Menu, session, ipcMain, shell} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const server = require('./server');
const axios = require('axios').default;
const cheerio = require('cheerio');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 680,
    title: 'Twitch Multi Chat',
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js'),
      nodeIntegration: true,
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.setMinimumSize(350, 100);

  //this.mainWindow.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
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

ipcMain.on('log_out', () => {
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
  return new Promise((resolve) => {
    exec(`streamlink --json twitch.tv/${channel}`, (error, stdout, stderr) => {
      if (error || stderr) {
        //if command not found
        resolve(alternateFetch(channel));
      } else {
        const resp = JSON.parse(stdout);
        let info = {streamer: '', category: '', title: '', live: null};
        if (resp.metadata) {
          //live or hosting
          info.live = true;
          info.streamer = resp.metadata.author;
          info.category = resp.metadata.category;
          info.title = resp.metadata.title;
        } else {
          //offline
          info.live = false;
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
  //vm = new ViewManager();
  createWindow();
  session.defaultSession.loadExtension(
    path.join(__dirname, './src/ext/FrankerFaceZ'),
    {
      allowFileAcces: true,
    }
  );
});

//close login window when done
app.on('browser-window-created', (e, w) => {
  w.webContents.on('will-navigate', (e2, url) => {
    if (url === 'https://www.twitch.tv/?no-reload=true') {
      e.preventDefault();
      this.mainWindow.webContents.send('refresh_user');
      w.close();
    }
  });
});
