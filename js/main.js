import * as sensors from './sensors.js';
import HTTP from './http.js';
import page from './index.html';
import { jwtVerifyAndDecode } from './hs256.js';

// Get this from https://manage.auth0.com/#/apis
const secret = 'test';
const audience = '/get-sensor-data';
const issuer = 'https://speyrott.auth0.com/';

sensors.startReports();

function validateJwt(headers) {
    try {
        const idx = headers.indexOf('ACCESS-TOKEN');
        if(idx === -1) {
            return false;
        }

        const decoded = jwtVerifyAndDecode(headers[idx + 1], secret);
        photon.log.trace(JSON.stringify(decoded));
        return decoded.valid && 
               decoded.payload.aud == audience &&
               decoded.payload.iss == issuer;
    } catch(e) {
        return false;
    }
    return false;
}

function sendSensorData(http, headers) {
    if(!validateJwt(headers)) {
        http.send401();
        http.close();
        return;
    }

    http.sendJson(JSON.stringify(sensors.getLastReport()));
}

function handler(http, headers, method, url) {
    if(url.indexOf('/get-sensor-data') !== -1) {
        sendSensorData(http, headers);
    } else {
        http.sendHtml(page);
    }
}

const server = photon.TCPServer(80);
let httpClients = [];
setInterval(() => {
    httpClients.push(new HTTP(server.available(), handler));
    
    const connected = [];
    httpClients.forEach(client => {
        client.process();

        if(!client.isConnected()) {
            return;
        }

        connected.push(client);        
    });

    // Discard disconnected clients.
    httpClients = connected;
}, 0);
