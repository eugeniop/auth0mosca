var mqtt = require('mqtt');

var settings = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: 'Thermostat 1a', //This is not the Auth0 ClientID (it is the MQTT clientID)
    username: 'the device username',
    password: 'the password'
};

// client connection
var client = mqtt.connect('mqtt://localhost:9999', settings);

setInterval(sendTemperature, 2000, client);

function sendTemperature(client) {

    console.log("Sending event");

    var t = {
        T: Math.random() * 100,
        Units: "C"
    };

    //publish on the "temperature" topic
    client.publish('temperature', JSON.stringify(t));
}

client.on('close', function() {
    console.log('close');
});
