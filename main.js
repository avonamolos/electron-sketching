const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Ова работи, инаку моментално го правам цел код да работи packaged кога е. А за development ќе го направам понатаму, ми личи понекомплицирано за development
// let backendPath;
// if (process.env.NODE_ENV === 'development') {
//   backendPath = path.join(__dirname, 'backend', 'backend.exe');
// } else {
//   backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'backend.exe');
// }

// const backendPath = path.join(__dirname, 'backend', 'backend.exe');
// backendProcess = spawn(backendPath, [], {
//   detached: false,
//   stdio: 'ignore',
//   windowsHide: true,  
// });

if (process.env.NODE_ENV === 'development') {
    try {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });
    } catch (err) {
        console.warn('Electron Reload not available in production.');
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800, 
        minHeight: 700,
        icon: path.join(__dirname, 'src', 'assets', 'computer.ico'),
        title: 'Cute Photo Sketch',
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
    let backendPath;
    if (process.env.NODE_ENV === 'development') {
        backendPath = path.join(__dirname, 'backend', 'backend.exe');
    } else {
        backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'backend.exe');
    }

    backendProcess = spawn(backendPath, [], {
        detached: false,
        stdio: 'ignore',
        windowsHide: true
    });
    backendProcess.on('close', (code) => console.log(`Backend exited with code ${code}`));

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

const { exec } = require('child_process');

app.on('before-quit', () => {
    
    if (backendProcess) {
        backendProcess.kill();
    }
    
    if (backendProcess) {
        console.log(`Forcefully killing backend with PID ${backendProcess.pid}...`);
        exec(`taskkill /PID ${backendProcess.pid} /T /F`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Failed to kill backend: ${err}`);
            } else {
                console.log(`Backend killed: ${stdout}`);
            }
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});