const fs = require('fs');
const path = require('path');

//Encryption assests
const privateKey  = fs.readFileSync(path.join(__dirname,'/localhost.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname,'/localhost.crt'), 'utf8');
const credentials = {key: privateKey, cert: certificate};

module.exports = {
    credentials
}