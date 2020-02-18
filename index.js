const electron = require('electron');
const url = require('url');
const path = require('path');
var mysql      = require('mysql2');

const {app, BrowserWindow, Menu, ipcMain} = electron;
//const ejs = require('ejs');
//const ejs = require('ejs-electron')
//set env
//process.env.NODE_ENV = 'production';

let mainWindow;

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 500,
        'minWidth': 1200,
        'minHeight': 700,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url.format({
        //pathname: path.join(__dirname, 'mainWindow.html'),
        pathname: path.join(__dirname, './components/main.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});

//Handle add windoe function

function createAddWindow() {

    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Item',
        webPreferences: {
            nodeIntegration: true
        }
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    addWindow.on('close', function () {
        addWindow = null;
    });
}

//catch item:add
ipcMain.on('item:add', function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//catch declaration:add
ipcMain.on('declaration:add', function (e, declaration) {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'admin',
        password : 'uatao',
        database : 'shop_db'
    });

    sql = `INSERT INTO declarations (sender, receiver) VALUES ( '${declaration.sender}',  '${declaration.receiver}')`;

    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log('Inserted');
        mainWindow.webContents.send('declaration:add', declaration);
    });

});

//menu
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if macOS
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tool action
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}