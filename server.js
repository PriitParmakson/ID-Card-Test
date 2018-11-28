/**
 */

'use strict';

// -------- Teekide laadimine  --------
const https = require('https'); // HTTPS (Node.js)
const fs = require('fs'); // Sertide laadimiseks
const path = require('path');

// -------- Konf-n --------
const CA_CERT = 'ca-TEST.cert';
const HTTPS_KEY = 'https-server-TEST.key'; // HTTPS privaatvõtme failinimi
const HTTPS_CERT = 'https-server-TEST.cert'; // HTTPS serdi failinimi

// ID-Kaardilt loetava isikutuvastusserdi valideerimiseks
// vajalikud SK vahe- ja juursert
const SK_VAHESERT = 'ESTEID-SK_2015.pem.crt';
const SK_JUURSERT = 'EE_Certification_Centre_Root_CA.pem.crt';

const HTTPS_PORT = 5000; // HTTPS Serveri port

console.log('Käivitun');

// -------- Defineeri HTTPS server -------- 
// Valmista ette HTTPS serveri suvandid
var HTTPS_options = {
  ca: [
    fs.readFileSync(path.join(__dirname, 'keys',
      CA_CERT), 'utf8'),
    fs.readFileSync(path.join(__dirname, 'keys',
      SK_VAHESERT), 'utf8'),
    fs.readFileSync(path.join(__dirname, 'keys',
      SK_JUURSERT), 'utf8')
  ],
  key: fs.readFileSync(path.join(__dirname, 'keys',
    HTTPS_KEY), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, 'keys',
    HTTPS_CERT), 'utf8'),
  requestCert: true,
  rejectUnauthorized: true,
  secureOptions:require('constants').SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION
};
var httpsServer = https.createServer(HTTPS_options);

// -------- Serti küsiv otspunkt --------
var optClientAuth = {
  requestCert: true,
  rejectUnauthorized: true
};

httpsServer.on('request', function (req, res) {
  console.log('Saabus päring: ' + req.url);
  var socket = req.connection;
  if (req.url == '/auth') {
    var result = socket.renegotiate(optClientAuth, function (err) {
      if (!err) {
        console.log(req.connection.getPeerCertificate());

        res.writeHead(200);
        res.end("Autenditud\n");
      } else {
        console.log(err.message);
      }
    });
  } else {
    res.writeHead(200);
    res.end("Autentimiseks sisesta /auth.\n");
  };
});

// -------- Käivita HTTPS server -------- 

// Käivita HTTPS server 
httpsServer.listen(HTTPS_PORT, () => {
  console.log('HTTPS-Server kuuldel pordil: ' + httpsServer.address().port);
});

