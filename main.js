var fs      = require('fs');
var express = require('express');
var http    = require('http');
var https   = require('https');
var path    = require('path');
var mongo   = require('mongodb');
require('./database');

var privateKey  = fs.readFileSync('certs/privkey.pem',   'utf8');
var certificate = fs.readFileSync('certs/fullchain.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };

var httpApp = express();
var app = express();
var port = process.env.PORT || 4664;

httpApp.get('*', (req, res) => {
  res.redirect('https://' + req.headers.host + req.url);
});

app.get('/', (req, res) => {
  res.sendFile(makeAbsolute('index.htm'));
});

app.get('/favicon.png', (req, res) => {
    res.sendFile(makeAbsolute('images/icon.png'));
})

app.get('/public/*', (req, res) => {
  absolutePath = makeAbsolute(req.url);
  if (fs.existsSync(absolutePath))
  {
    res.sendFile(absolutePath);
  } else {
    res.sendStatus(404)
  }
})

app.get(('/message/*'), (req, res) => {
  res.send("message received: " + req.url);
  var message = req.url.substr(req.url.indexOf("/", 1)+1);
  console.log(unescape(message))
})

var httpServer  = http.createServer(httpApp);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(8080);
httpsServer.listen(8443);

makeAbsolute = (relativePath) => {
  return path.join(__dirname, relativePath);
}

establishConnection(mongo);
