import express from 'express';
import multiparty from 'multiparty';
import shortid from 'shortid';
import AWS from 'aws-sdk';

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
    }).on('part', part => {
        s3.putObject({
            Bucket: bucket,
            Key: slug,
            Body: part,
            ContentLength: part.byteCount,
        }, err => {
            if (err) {
                return res.status(500).json({
                    file: 'Could not upload file.'
                });
            };

            res.json({
                id: slug
            });
        });
    }).parse(req);
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

        const stream = s3.getObject(params).createReadStream();

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
