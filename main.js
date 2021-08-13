const path = require("path");
const { app, Menu, ipcMain } = require("electron");
const Store = require("./Store");
const MainWindow = require("./MainWindow");
const AppTray = require("./AppTray");

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
    const file = `${__dirname}/app/index.html`;
    mainWindow = new MainWindow(file, isDev);
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
    {
        label: 'View',
        submenu: [{
            label: 'Toggle Navigation',
            click: () => mainWindow.webContents.send('nav:toggle')
        }]
    }
]


app.on('ready', () => {

    createMainWindow();

    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.send('settings:get', store.get('settings'));
    });

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('close', e => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide()
        }
        return true;
    })

    const tray_icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
    // Create Tray
    tray = new AppTray(tray_icon, mainWindow);

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