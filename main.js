const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, Tray } = require("electron");
const log = require("electron-log");
const Store = require("./Store");

// Set env
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
// Check Platforms
const isMac = process.platform !== 'darwin' ? false : true;

let mainWindow;
let tray;

// Init Store & Defaults
const store = new Store({
    configName: 'user-settings',
    defaults: {
        settings: {
            cpuOverload: 80,
            alertFrequency: 5
        }
    }
});

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "SysTop",
        width: isDev ? 700 : 355,
        height: 500,
        opacity: 0.9,
        show: false,
        resizable: isDev,
        icon: `${__dirname}/assets/icons/icon.png`,
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

    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.send('settings:get', store.get('settings'));
    });

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    const tray_icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
    // Create Tray
    tray = new Tray(tray_icon);
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    })

    mainWindow.on('ready', () => (mainWindow = null))
});

ipcMain.on('settings:set', (e, value) => {
    store.set('settings', value);
    mainWindow.webContents.send('settings:get', store.get('settings'));
})

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