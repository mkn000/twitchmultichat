const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'twitchmultichat-win32-ia32/'),
    authors: 'mkn000',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'twitchmultichat.exe',
    setupExe: 'TwitchMultiChatInstaller.exe',
    setupIcon: path.join(rootPath, 'icon.ico'),
    iconUrl: "https://github.com/mkn000/twitchmultichat/raw/master/icon.ico"
  })
}