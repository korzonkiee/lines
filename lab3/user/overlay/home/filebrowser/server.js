var express = require("express");
var path = require("path");
var fs = require("fs");
var config = require("./config");
var _ = require("underscore");
var basicAuth = require('basic-auth');
var fileUpload = require('express-fileupload');
var mv = require('mv');

var app = express();

app.use(fileUpload());
app.use(express.static(config.filesPath));
app.use(express.static(path.join(__dirname, "public")));
app.use('/packages', express.static(__dirname + '/node_modules/'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/files", (req, res) => {
    let selectedDir = config.filesPath;
    let query = req.query.path || "";

    if (query) 
        selectedDir = path.join(config.filesPath, query);

    console.log(`Browsing ${selectedDir}`);

    fs.readdir(selectedDir, (err, files) => {
        if (err) throw err;
        let data = [];
        
        files.forEach(file => {
            if (config.filesExclude.includes(file))
                return;

            try {
                let filePath = path.join(selectedDir, file);
                let fileStats = fs.statSync(filePath);
                let fileSize = fileStats.size / 1000000.0;
                let isDirectory = fileStats.isDirectory();
                data.push({ name: file, isDirectory: isDirectory, path: path.join(query, file), size: fileSize });
            } catch(e) {
                console.error(e);
            }
        });

        data = _.sortBy(data, f => f.name);
        res.json(data);
    })
});

let auth = function (req, res, next) {
    var user = basicAuth(req);
    
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
    }
    if (user && user.name === config.user && user.pass === config.password) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
    }
}

app.post("/upload", auth, (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    let file = req.files.file;
    let uploadDir = path.join(config.filesPath, req.body.path);

    file.mv(path.join(uploadDir, file.name), function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});

var server = app.listen(config.port, function() {
    console.log(`File-browser launched on port ${config.port}`);
});