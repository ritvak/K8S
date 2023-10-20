const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// here is my conatiner 1 code 
const fileDataDirectory = path.join(__dirname, 'Ritva_PV_dir');

app.use(express.json());

app.post('/calculate', async (req, res) => {
    const requestData = req.body;
    if (requestData.file == undefined) {
        res.status(200).json({
            "file": null,
            "error": "Invalid JSON input."
        });
    } else {
        const file = requestData.file;
        const product = requestData.product;

        fs.readFile(path.join(fileDataDirectory, file), 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                if (err.code === 'ENOENT') {
                    res.status(200).json({
                        "file": file,
                        "error": "File not found."
                    });
                } else {
                    res.status(200).json({ error: 'Failed to read file' });
                }
            } else {
                try {
                    const response = await axios.post('http://app2:4000/calculate', {
                        file: file,
                        product: product
                    });

                    const responseData = response.data;
                    const sum = responseData.sum;
                    const error = responseData.error;
                    res.status(200).json({ file: file, sum, error });
                } catch (error) {
                    console.error('Error fetching data:', error);
                    res.status(200).json({ error: 'Failed to fetch data' });
                }
            }
        });
    }
});

app.post("/store-file", async (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        const errorMessage = {
            file: null,
            error: "Invalid JSON input.",
        };
        res.status(200).send(errorMessage);
    } else {
        try {
            const transformedData = data.replace(/, /g, ",");
            fs.writeFileSync(path.join(fileDataDirectory, file), transformedData);
            const responseMessage = {
                file: file,
                message: "Success.",
            };

            res.status(200).send(responseMessage);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                file: file,
                error: "Error while storing the file to the storage.",
            };
            res.status(500).send(errorMessage);
        }
    }
});

const port = 3000;

app.listen(port, () => console.log(`app listening on http://localhost:${port}`));
