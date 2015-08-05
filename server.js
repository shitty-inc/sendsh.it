var express    = require('express');
var fs         = require('fs');
var mongo      = require('mongodb');
var Grid       = require('gridfs-stream');
var path       = require('path');
var multiparty = require('multiparty');
var shortid    = require('shortid');
var cron       = require('cron');

var app_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var app_ip   = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var db_host = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1';
var db_port = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
var db_name = process.env.OPENSHIFT_APP_NAME || 'sendshit';
var db_user = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin';
var db_pass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || '123456';

var db  = new mongo.Db(db_name, new mongo.Server(db_host, db_port), { safe : false });
var gfs = new Grid(db, mongo);

db.open(function (err) {

    if (err) throw err;

    db.authenticate(db_user, db_pass, function(err, res) {

        if (err) throw err;

        var pruneJob = cron.job("0 */1 * * * *", function() {

            var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

            gfs.files.find({ uploadDate: {$lt: yesterday } }).forEach(function (file) {

                gfs.remove({ filename: file.filename }, function () {

                    console.log('Pruned ' + file.filename);

                });

            });
            
        });

        pruneJob.start();

        var app = express();

        app.use(express.static(path.join(__dirname, 'public')));

        app.post('/upload', function(req, res) {

            var form = new multiparty.Form({
                maxFilesSize: 5000000
            });

            form.on('error', function(err) {

                res.status(400).json({ file: 'File is too large.' });

            }).on('file', function(name, file) {

                var slug        = shortid.generate();
                var writestream = gfs.createWriteStream({ filename: slug });

                fs.createReadStream(file.path).on('error', function() {

                    res.json({ error: 'Upload failed.' });
                    
                }).pipe(writestream);

                res.json({ id: slug });

            }).parse(req);

        });

        app.get('/download', function(req, res) {

            gfs.findOne({ filename: req.query.id }, function (err, file) {

                if (err || file === null) return res.json({ error: 'File not found.' });

                gfs.createReadStream({ filename: req.query.id }).on('close', function () {

                    gfs.remove({ filename: req.query.id }, function () {});

                }).pipe(res);

            });

        });

        app.listen(app_port, app_ip);

    });

});