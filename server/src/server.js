import express from 'express';
import multiparty from 'multiparty';
import shortid from 'shortid';
import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3();
const app = express();
const bucket = 'sendsh.it';

app.use(express.static(__dirname + '/../../public'));

app.post('/upload', (req, res) => {
    const slug = shortid.generate();
    const form = new multiparty.Form({
        maxFilesSize: 5000000
    });

    form.on('error', () => {
        res.status(400).json({
            file: 'File is too large.'
        });
    }).parse(req, function (err, fields, files) {
        const upload = files.file[0];

        s3.upload({
            Bucket: bucket,
            Key: slug,
            Body: fs.createReadStream(upload.path)
        }, err => {
            if (err) {
                console.log(err);

                res.status(500).json({
                    file: 'Could not upload file.'
                });
            } else {
                res.json({
                    id: slug
                });

                fs.unlink(upload.path);
            }
        });
    });
});

app.get('/download', function(req, res) {
    const params = {
        Bucket: bucket,
        Key: req.query.id,
    };

    s3.headObject(params, err => {
        if (err) {
            return res.json({
                error: 'File not found.'
            });
        }

        const stream = s3.getObject(params).on('httpHeaders', (statusCode, headers) => {
            res.set('Content-Length', headers['content-length']);
            res.set('Content-Type', headers['content-type']);
        }).createReadStream();

        stream.on('error', () => {
            return res.json({
                error: 'Download error.'
            });
        }).on('end', () => {
            s3.deleteObject(params).send();
        }).pipe(res);
    });
});

module.exports = app
