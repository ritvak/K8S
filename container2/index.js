const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');


const fileDataDirectory = path.join(__dirname, 'Ritva_PV_dir');

app.use(express.json());

app.post('/calculate', (req, res) => {
  const requestData = req.body;
  const file = requestData.file;
  const product = requestData.product;

  fs.readFile(path.join(fileDataDirectory, file), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Failed to read file' });
      return;
    }

    const data1 = data;
    const rows = data.trim().split('\n');

    if (!isFileInCorrectFormat(data1)) {
      res.status(200).json({ file: file, error: "Input file not in CSV format." });
      return;
    } else {

      let sum = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim().split(',');
        const rowProduct = row[0].trim();
        const amount = parseInt(row[1].trim());

        if (rowProduct === product) {
          sum += amount;
        }
      }

      res.status(200).json({ file: file, sum: sum.toString() });
    }
  });
});

function isFileInCorrectFormat(content) {
  const lines = content.trim().split('\n');

  if (lines.length === 0) {
    return false;
  }

  const firstLine = lines[0].trim();
  const values = firstLine.split(',');

  if (values.length <= 1 || !isColumnHeaderValid(values)) {
    return false;
  }

  const numValues = values.length;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineValues = line.split(',');

    if (lineValues.length !== numValues) {
      return false;
    }
  }

  return true;
}

function isColumnHeaderValid(values) {
  const expectedHeaders = ["product", "amount"];
  const headers = values.map(header => header.toLowerCase());

  return expectedHeaders.every(expectedHeader => headers.includes(expectedHeader));
}

const port = 4000;

app.listen(port, () => console.log(`app listening on http://localhost:${port}`));
