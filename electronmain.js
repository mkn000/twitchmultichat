const {app, session, ipcMain} = require('electron');
const {ViewManager} = require('./ViewManager');
const path = require('path');
const server = require('./server');

let vm;

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

ipcMain.on('join_prompt', (e) => {
  vm.joinPrompt();
});

ipcMain.on('sub_window', (e, type) => {
  vm.subWindow(type);
});

ipcMain.on('join_channel', (e, channel) => {
  console.log(channel);
  vm.newView(channel);
});

ipcMain.on('close_chat', (e, ix) => {
  vm.closeView(ix);
});

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
    .catch((e) => console.log(e));
});

app.on('ready', () => {
  vm = new ViewManager();
  session.defaultSession.loadExtension(
    path.join(__dirname, './src/ext/FrankerFaceZ'),
    {
      allowFileAcces: true,
    }
  );
});
