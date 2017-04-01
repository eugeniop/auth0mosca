var mqtt = require('mqtt');

var settings = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: 'Reader-1',
    username: 'subscriber username',
    password: 'subscriber password'
}

// client connection
var client = mqtt.connect('mqtt://localhost:9999', settings);

client.on('connect', function() {

    client.subscribe('temperature');
});

client.on('message', function(topic, message, packet) {

    if (topic === 'temperature') {
        console.log('New reading', message);
    }
});

client.on('close', function() {
    console.log('close');
});
