const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    addUrl: (url) => ipcRenderer.send('add-url', url),
    onAddUrl: (callback) => ipcRenderer.on('add-url', (event, url) => callback(url))
});