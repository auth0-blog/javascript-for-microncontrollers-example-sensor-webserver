const interval = 5000;
const host = 'i5-4590-LIN';
const eventReport = 'sensor-report';
const eventAlarm = 'sensor-alarm';
const port = 3000;
const gasThreshold = 1000;
const tempThreshold = 40;
const alarmWaitMs = 5000;

const pins = {
    movement: photon.pin.D0,
    flame: photon.pin.D1,
    humidity: photon.pin.D2,
    gas: photon.pin.A0
}

Object.keys(pins).forEach(k => {
    photon.pin.mode(pins[k], 'INPUT');
});

photon.pin.mode(pins.humidity, 'INPUT_PULLDOWN');

function readSensors() {
    const dht = dht11.read(pins.humidity);
    return {
        movement: photon.pin(pins.movement),
        flame: !photon.pin(pins.flame),
        humidity: dht.humidity,
        temperature: dht.temperature,
        gas: photon.pin(pins.gas)
    };
}

function checkData(data) {
    return data.movement || 
           data.flame || 
           (data.gas > gasThreshold) || 
           (data.temperature > tempThreshold);
}

function sendData(data) {
    const client = photon.TCPClient();
    
    client.connect(host, port);
    if(!client.connected()) {
        photon.log.error(`Could not connect to ${host}, discarding data.`);
        return;
    }

    client.write(JSON.stringify(data) + '\n');
    client.stop();
}

function sendEvent(event, data) {
    try {
        const datastr = JSON.stringify(data);
        photon.log.trace(`Sending event ${event}, data: ${datastr}`);
        photon.publish(event, datastr);
    } catch(e) {
        photon.log.error(`Could not publish event: ${e.toString()}`);
    }
}

let data = {};
let timeSinceAlarmMs = 0;

// Check sensors as fast as possible for values outside the normal thresholds
setInterval(() => {
    timeSinceAlarmMs += 500;

    try {
        data = readSensors();
        if(checkData(data)) {
            photon.pin(photon.pin.D7, true);
            if(timeSinceAlarmMs >= alarmWaitMs) {
                sendEvent(eventAlarm, data);
                sendData(data);
                timeSinceAlarmMs = 0;
            }
        } else {
            photon.pin(photon.pin.D7, false);
        }
    } catch(e) {
        photon.log.error(e.toString());
    }
}, 500);

// Send a snapshot every interval milliseconds
setInterval(() => {
    try {
        sendEvent(eventReport, data);
        sendData(data);
    } catch(e) {
        photon.log.error(e.toString());
    }
}, interval);
