const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('myApi', {
  send: (channel, data) => {
    console.log(`${channel} sending: ${data}`);
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (e, data) => {
      func(data);
    });
  },
  request: (channel, args) => {
    return ipcRenderer.invoke(channel, args);
  },
});
