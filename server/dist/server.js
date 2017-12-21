'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _multiparty = require('multiparty');

var _multiparty2 = _interopRequireDefault(_multiparty);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s3 = new _awsSdk2.default.S3();
var app = (0, _express2.default)();
var bucket = 'sendsh.it';

app.use(_express2.default.static(__dirname + '/../../public'));

app.post('/upload', function (req, res) {
    var slug = _shortid2.default.generate();
    var form = new _multiparty2.default.Form({
        maxFilesSize: 5000000
    });

    form.on('error', function () {
        res.status(400).json({
            file: 'File is too large.'
        });
    }).parse(req, function (err, fields, files) {
        var upload = files.file[0];

        s3.upload({
            Bucket: bucket,
            Key: slug,
            Body: _fs2.default.createReadStream(upload.path)
        }, function (err) {
            if (err) {
                console.log(err);

                res.status(500).json({
                    file: 'Could not upload file.'
                });
            } else {
                res.json({
                    id: slug
                });

                _fs2.default.unlink(upload.path);
            }
        });
    });
});

app.get('/download', function (req, res) {
    var params = {
        Bucket: bucket,
        Key: req.query.id
    };

    s3.headObject(params, function (err) {
        if (err) {
            return res.json({
                error: 'File not found.'
            });
        }

        var stream = s3.getObject(params).on('httpHeaders', function (statusCode, headers) {
            res.set('Content-Length', headers['content-length']);
            res.set('Content-Type', headers['content-type']);
        }).createReadStream();

        stream.on('error', function () {
            return res.json({
                error: 'Download error.'
            });
        }).on('end', function () {
            s3.deleteObject(params).send();
        }).pipe(res);
    });
});

module.exports = app;