const busboy = require('busboy');
const { existsSync, mkdirSync, createWriteStream } = require('fs');
const path = require('path');

exports.submitForm = (req, res) => {
    const headers = req.headers;
    const bb = busboy({headers: headers});

    const formTextualData = {};

    const uploadsDir = path.join(__dirname, 'uploads');
    if(!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir);
    }

    bb.on('file', (name, file, info) => {
        const pathWithFileName = path.join(uploadsDir, `myfile${path.extname(info.filename).toLowerCase()}`);
        const stream = createWriteStream(pathWithFileName);

        file.pipe(stream);

        file.on('data', (data) => {
            const written = stream.bytesWritten;
            const total = parseInt(headers['content-length']);
            const uploadPercentage = ((written / total) * 100).toFixed(2);

            res.write(`Uploading  ...  ${uploadPercentage}% done\n\n`);
        }).on('close', () => {
            formTextualData['file'] = pathWithFileName;
            res.write(`File [${name}] done\n\n`);
        });

        stream.on('error', (err) => {
            console.error(`Stream error for file:`, err);
            res.status(500).send('File upload failed.');
        });

        file.on('error', (err) => {
            console.error(`File stream error for file:`, err);
            res.status(500).send('File upload failed.');
        });
    });

    bb.on('field', (name, val, info) => {
        if(['username', 'name'].includes(name)) {
            formTextualData[name] = val;
        }
    });

    bb.on('close', () => {
        console.log('Done parsing form!');
        console.log(formTextualData);
        res.end();
        // res.status(200).send('Submitted successfully!');
    });

    req.pipe(bb);
}