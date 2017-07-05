'use latest';

const express = require('express');
const webtask = require('webtask-tools');
const bodyParser = require('body-parser');
const sendmail_ = require('sendmail')();
const Promise = require('bluebird');

const sendmail = Promise.promisify(sendmail_);

const app = express();

function checkCredentials(req, res, next) {
    const secret = req.webtaskContext.secrets.secret;
    const coreid = req.webtaskContext.secrets.coreid;

    const reqSecret = req.get('Secret');
    const reqCoreid = req.body.coreid;

    if(secret === reqSecret && coreid === reqCoreid) {
        next();
    } else {
        console.log(`Unauthorized request by ${req.ip}`);
        res.sendStatus(401);
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(checkCredentials);

function sendEmail(context, data) {
    const promisifyOpts = { context: context.storage };
    const storageGet = Promise.promisify(context.storage.get, promisifyOpts);
    const storageSet = Promise.promisify(context.storage.set, promisifyOpts);

    return storageGet().then(stored => {
        if(!stored) {
            stored = {};
        }

        const last = stored.lastEmailTimestamp ? stored.lastEmailTimestamp : 0;
        const minPeriod = context.secrets.emailMinPeriod;
        const now = Date.now();
        const timediff = now - last;
        
        if(timediff > minPeriod) {
            const pretty = JSON.stringify(JSON.parse(data), null, 4);

            return sendmail({
                from: 'sensors-webtask@webtask',
                to: context.secrets.email,
                subject: 'SENSOR ALARM',
                text: pretty
            }).then(() => {
                stored.lastEmailTimestamp = now;
                return storageSet(stored);              
            });
        }
    }, e => {
        console.log(`Error while sending e-mail: ${e.stack}`);
    });
}

app.post('/', (req, res) => {
    if(req.body.event === 'sensor-alarm') {        
        sendEmail(req.webtaskContext, req.body.data).finally(() => {
            res.end();
        });
    } else {
        res.end();
    }
});

// Expose this express server as a webtask-compatible function

module.exports = webtask.fromExpress(app);
