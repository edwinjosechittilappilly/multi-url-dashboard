const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            plugins: true
        }
    });

    // Set a realistic user-agent
    mainWindow.webContents.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

    // Listen for URL add event
    ipcMain.on('add-url', (event, url) => {
        mainWindow.webContents.send('add-url', url);
    });
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});