const {contextBridge, ipcRenderer} = require('electron');
const {exec} = require('child_process');
const axios = require('axios').default;

contextBridge.exposeInMainWorld('myApi', {
  login: (func) => {
    ipcRenderer.on('token', (event, res) => {
      console.log(event);
      func(res);
    });
    ipcRenderer.send('login', {msg: ''});
  },
  getUser: () => {
    return ipcRenderer.invoke('user_info').then((resp) => {
      return resp;
    });
  },
  send: (channel, data) => {
    console.log('sending:' + data);
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (e, data) => {
      func(data);
    });
  },
  request: (channel) => {
    return ipcRenderer.invoke(channel);
  },
  getStream(channel, callback) {
    exec(`streamlink --json twitch.tv/${channel}`, callback);
  },
});
