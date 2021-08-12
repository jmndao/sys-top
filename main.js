const { app, BrowserWindow, Menu } = require("electron");
const log = require("electron-log");

// Set env
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
// Check Platforms
const isMac = process.platform !== 'darwin' ? false : true;

let mainWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "SysTop",
        width: isDev ? 800 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/icon.png`,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Load files
    mainWindow.loadFile(`${__dirname}/app/index.html`);
};

const menu = [
    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' }
        ]
    }] : []),
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
]


app.on('ready', () => {

    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
});