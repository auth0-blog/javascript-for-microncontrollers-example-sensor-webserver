import { HTTPParser } from './http-parser.js';

// Patch String.toString to emulate Node's Buffer#toString
// (required for the http-parser lib).
/*const oldToString = String.prototype.toString;
String.prototype.toString = function(encoding, start, end) {
    if(typeof start === 'undefined') {
        start = 0;
    }
    return oldToString.call(substring(start, end));
}*/

function getMimeType(type) {
    if(type === 'json') {
        return 'application/json';
    } else if(type === 'html') {
        return 'text/html';
    } else {
        return 'text/plain';
    }
}

function getStatus(status) {
    switch(status) {
        case 200:
            return '200 OK';
        case 401:
            return '401 Unauthorized';
        default:
            return '500 Internal Server Error';
    }
}

function getDataHeaders(type, data) {
    if(!data) {
        return '';
    }

    return `Content-Length: ${data.length}\r\n` +
           `Content-Type: ${getMimeType(type)}\r\n`;
}

function sendResponse(client, status, type, data) {
    const msg = `HTTP/1.1 ${getStatus(status)}\r\n` + 
                `Server: Custom\r\n` + 
                getDataHeaders(type, data) +
                `Connection: Closed\r\n\r\n`;

    client.write(msg);
    
    if (data) {
        const chunkSize = 256;
        for(let bytes = 0; bytes < data.length; bytes += chunkSize) {
            const chunk = data.substr(bytes, chunkSize);
            
            for (let written = 0; written < chunk.length;) {
                written += client.write(chunk.substring(written));
                //photon.log.trace(written);
                photon.process();
            }
        }        
    }
}

export default class HTTP {
    constructor(tcpClient, handler) {
        this.client = tcpClient;
        
        this.parser = new HTTPParser('REQUEST');
        
        this.parser[HTTPParser.kOnHeadersComplete] = info => {
            handler(this, info.headers, info.method, info.url);
        };
    }

    process() {
        if(this.client.available() === 0) {
            return;
        }

        this.parser.execute(this.client.read());
    }

    isConnected() {
        return this.client.connected();
    }

    sendHtml(html) {
        sendResponse(this.client, 200, 'html', html);
    }

    sendJson(json) {
        sendResponse(this.client, 200, 'json', json);
    }

    send401() {
        sendResponse(this.client, 401);
    }

    close() {
        this.client.stop();
    }
}
