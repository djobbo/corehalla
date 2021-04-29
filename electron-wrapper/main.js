const { app, BrowserWindow } = require('electron');

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			nodeIntegration: true,
		},
		frame: false,
		resizable: true,
	});

	win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
