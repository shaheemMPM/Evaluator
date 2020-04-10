// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const excelToJson = require('convert-excel-to-json')

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let FindResult = (content) => {
  const data = excelToJson({
    source: content
  })
  console.log(data)
}

let openFile = () => {

  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{name: 'SpreadSheet', extensions: ['xlsx']}]
  }).then(result => {
      const file = result.filePaths[0];
      const fileContent = fs.readFileSync(file)
      FindResult(fileContent)
  }).catch(err => {
      console.log(err)
  });

}

ipcMain.on('asynchronous-message', (evennt, args) => {
  if (args === 'openDialog') {
    openFile();
  }
})