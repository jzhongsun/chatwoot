const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

const dashboard = async (req, res) => {
  fs.readFile(
    path.join(__dirname, 'dist/dashboard.html'),
    'utf8',
    (err, data) => {
      res.send(data);
    }
  );
};

const v3app = async (req, res) => {
  fs.readFile(path.join(__dirname, 'dist/v3app.html'), 'utf8', (err, data) => {
    res.send(data);
  });
};

const widget = async (req, res) => {
  fs.readFile(path.join(__dirname, 'dist/v3app.html'), 'utf8', (err, data) => {
    res.send(data);
  });
};

app.get('/', dashboard);
app.get('/app/login', v3app);
app.get('/app/', dashboard);
app.get('/app/accounts/**', dashboard);
app.get('/widget', widget);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
