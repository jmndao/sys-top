const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {

    constructor(file, isDev) {

        super({
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

        this.loadFile(file);

        if (isDev) {
            this.webContents.openDevTools();
        }
    }
};

module.exports = MainWindow;