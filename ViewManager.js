const path = require('path');
const {
  app,
  BrowserWindow,
  BrowserView,
  webContents,
  Menu,
} = require('electron');

class ViewManager {
  mainWindow = null;
  defaultWidth = 403;

  constructor() {
    if (!this.mainWindow) {
      this.mainWindow = new BrowserWindow({
        width: this.defaultWidth,
        height: 680,
        title: 'Twitch Multi Chat',
        webPreferences: {
          preload: path.join(app.getAppPath(), 'preload.js'),
          //nodeIntegration: true,
        },
      });
      Menu.setApplicationMenu(null);
      this.mainWindow.loadURL('http://localhost:3000');
      //this.mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
      this.mainWindow.setMinimumSize(350, 100);
      this.joinPrompt();

      this.mainWindow.openDevTools();

      this.mainWindow.on('resize', () => {
        this.resizeViews();
      });

      this.mainWindow.on('closed', function () {
        this.mainWindow = null;
      });

      setInterval(() => {
        this.mainWindow.getBrowserViews().forEach((view) => {
          console.log(`x: ${view.getBounds().x}, w: ${view.getBounds().width}`);
        });
      }, 5000);
    }
  }

  viewRatios() {
    const widths = this.mainWindow.getBrowserViews().map((view) => {
      return view.getBounds().width;
    });
    const fullWidth = widths.reduce((total, val) => {
      return total + val;
    }, 0);
    const ratios = widths.map((val) => {
      return val / fullWidth;
    });
    console.log(ratios);
    return ratios;
  }

  resizeViews() {
    const [sx, sy] = this.mainWindow.getSize();
    const nviews = this.mainWindow.getBrowserViews().length;
    if (nviews > 0) {
      const w = Math.floor(sx / nviews);
      this.mainWindow.setSize(w * nviews, sy);
      this.setViewPos(w);
      this.viewRatios();
    }
  }

  resizeWindow() {
    const viewWidth = this.mainWindow
      .getBrowserViews()
      .reduce((total, view) => {
        return (total += view.getBounds().width);
      }, 0);
    this.mainWindow.setSize(
      this.defaultWidth +
        viewWidth +
        2 +
        (this.mainWindow.getBrowserViews().length - 1) * 7,
      680
    );

    return this.mainWindow.getSize();
  }

  setViewPos(w = this.defaultWidth) {
    this.mainWindow.getBrowserViews().forEach((view, ix, arr) => {
      try {
        view.setBounds({
          x: arr[ix - 1].getBounds().x + arr[ix - 1].getBounds().width + 6,
          y: 105,
          width: w,
          height: 550,
        });
      } catch {
        view.setBounds({x: 1, y: 105, width: w, height: 550});
      }
    });
  }

  newView(channel) {
    /*
    let newView = new BrowserView({
      webPreferences: {nodeIntegration: false},
    });
    newView.setAutoResize({height: true});
    this.mainWindow.addBrowserView(newView);
    this.resizeWindow();
    this.setViewPos();
    newView.webContents.loadURL(`https://twitch.tv/${channel}/chat/popout`);
    newView.webContents.openDevTools();
    */
    this.mainWindow.webContents.send('joined_channel', channel);
  }

  closeView(ix) {
    this.mainWindow.removeBrowserView(this.mainWindow.getBrowserViews()[ix]);
    this.setViewPos();
    this.resizeWindow();
  }

  subWindow(type) {
    const [mainX, mainY] = this.mainWindow.getPosition();
    const [mainWidth, mainHeight] = this.mainWindow.getSize();
    let subWindow = new BrowserWindow({
      x: Math.floor(mainX + mainWidth / 2) - 150,
      y: mainY + 100,
      parent: this.mainWindow,
      modal: true,
      resizable: false,
      title: 'Join Channel',
      webPreferences: {
        preload: path.join(app.getAppPath(), 'preload.js'),
        //nodeIntegration: true,
      },
    });
    switch (type) {
      case 'login':
        subWindow.setBounds({
          width: 500,
          height: 600,
          x: Math.floor(mainX + mainWidth / 2) - 250,
          y: mainY + 100,
        });
        subWindow.webContents.loadURL('https://twitch.tv/login');
        subWindow.webContents.on('will-navigate', (e, url) => {
          if (url === 'https://www.twitch.tv/?no-reload=true') {
            e.preventDefault();
            this.mainWindow.webContents.send('refresh_user');
            subWindow.close();
          }
        });
        break;
      case 'join':
        subWindow.setBounds({
          width: 300,
          height: 200,
        });
        subWindow.loadURL(`file://${__dirname}/dist/join.html`);
        break;
      default:
        break;
    }
    subWindow.on('closed', function () {
      subWindow = null;
    });
  }

  loginPrompt() {
    const [mainX, mainY] = this.mainWindow.getPosition();
    const [mainWidth, mainHeight] = this.mainWindow.getSize();
    const loginWindow = new BrowserWindow({
      x: Math.floor(mainX + mainWidth / 2) - 150,
      y: mainY + 150,
      parent: this.mainWindow,
      modal: true,
      resizable: false,
      title: 'Twitch Login',
    });
    loginWindow.webContents.loadURL('https://twitch.tv/login');
    loginWindow.webContents.on('will-navigate', (e, url) => {
      console.log(url);
    });
  }

  joinPrompt() {
    const [mainX, mainY] = this.mainWindow.getPosition();
    const [mainWidth, mainHeight] = this.mainWindow.getSize();
    let joinWindow = new BrowserWindow({
      width: 300,
      height: 300,
      x: Math.floor(mainX + mainWidth / 2) - 150,
      y: mainY + 150,
      parent: this.mainWindow,
      modal: true,
      resizable: false,
      title: 'Join Channel',
      webPreferences: {
        preload: path.join(app.getAppPath(), 'loadfiles.js'),
        //nodeIntegration: true,
      },
    });
    joinWindow.loadURL(`file://${__dirname}/dist/join.html`);

    joinWindow.on('closed', function () {
      joinWindow = null;
    });
  }

  sendUser(name) {
    console.log('sending user data: ', name);
    this.mainWindow.webContents.send('login_info', name);
  }
}

module.exports = {ViewManager};
