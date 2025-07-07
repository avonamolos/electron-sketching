const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800, 
        minHeight: 700,
        frame: false, 
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js')
        }
    });

    win.loadFile(path.join('src', 'index.html'));
    //win.loadFile(path.join(__dirname, 'src', 'index.html'));

    ipcMain.on('minimize-window', () => {
        win.minimize();
    });

    
    // Close Window
    ipcMain.on('close-window', () => {
        win.close();
    });

    // Save Sketch
    ipcMain.on('save-sketch', async (event, sketchDataUrl) => {
    const window = BrowserWindow.getFocusedWindow();
    const { filePath } = await dialog.showSaveDialog(window, {
        title: 'Save Sketch',
        defaultPath: 'sketch.png',
        filters: [
        { name: 'Images', extensions: ['png'] }
        ]
    });

    if (filePath) {
        // remove the "data:image/png;base64," part and save as PNG
        const base64Data = sketchDataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(filePath, base64Data, 'base64');
    }
    });

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

});