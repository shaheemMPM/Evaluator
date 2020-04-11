// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const excelToJson = require('convert-excel-to-json')
const json2xls = require('json2xls')

let mainWindow, file, data

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    fullscreenable: false,
    icon: './images/icon.png',
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
  data = excelToJson({
    source: content
  })
}

let openFile = (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{name: 'SpreadSheet', extensions: ['xlsx']}]
  }).then(result => {
      file = result.filePaths[0]
      const fileContent = fs.readFileSync(file)
      FindResult(fileContent)
      let fileName = file.split('/').pop()
      event.sender.send('asynchronous-reply', fileName)
  }).catch(err => {
      console.log(err)
  })
}

ipcMain.on('asynchronous-message', (event, args) => {
  if (args === 'openDialog') {
    openFile(event)
  }
})

ipcMain.on('data-channel', (event, args) => {
  let noQue = args.noQues
  let noJunks = args.noJunk
  let answers = args.answer
  let sheetName = Object.keys(data)[0]
  let final = {}
  final[`${sheetName}`] = []
  let header = data[sheetName][0]
  let tempHd = {}
  for (let j = 0; j < noJunks; j++) {
    let tempKey = Object.keys(header)[j]
    let tempVal = Object.values(header)[j]
    tempHd[`${tempKey}`] = tempVal
  }
  tempHd[`${String.fromCharCode(65+noJunks)}`] = 'Mark'
  final[sheetName].push(tempHd)

  let responses = data[sheetName].slice(1)

  for (let i = 0; i < responses.length; i++) {
    let tempStd = responses[i]
    let stdRes = {}
    let tempStdRes = Object.values(tempStd)
    let stdMarks = 0
    for (let j = 0; j < noJunks; j++) {
      let tempKey = Object.keys(tempStd)[j]
      let tempVal = Object.values(tempStd)[j]
      stdRes[`${tempKey}`] = tempVal
      tempStdRes = tempStdRes.slice(1)
    }
    for (let j = 0; j < noQue; j++) {
      if (tempStdRes[j] === answers[j]) {
        stdMarks += 4
      }else if (tempStdRes[j] === '') {
        continue
      }else {
        stdMarks -= 1
      }
    }
    stdRes[`${String.fromCharCode(65+noJunks)}`] = stdMarks
    final[sheetName].push(stdRes)
  }
  let jsonArr = final[sheetName]
  let xlsx = json2xls(jsonArr);
  let outFilePath = file.split('/')
  outFilePath.pop()
  outFilePath = outFilePath.join('/')
  let copyPath = outFilePath
  outFilePath += `/results${+new Date()}.xlsx`
  fs.writeFileSync(outFilePath, xlsx, 'binary')
  event.sender.send('success-reply', copyPath)
})