const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 640,
		minHeight: 360,
		title: 'Void Descent',
		autoHideMenuBar: true,
		backgroundColor: '#000000',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false
		}
	});

	win.setMenuBarVisibility(false);
	win.loadFile('index.html');
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
