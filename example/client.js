var Auth0Mosca = require('auth0mosca');

var mqtt = require('mqtt')
  , host = 'localhost'
  , port = '9999';

var settings = {
  keepalive: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clientId: 'Thermostat 1a', //This is not the Auth0 ClientID (it is the MQTT clientID)
  username:'deviceUsername',
  password: 'devicePassword'
};

// client connection
var mqttClient = mqtt.createClient(port, host, settings);

setInterval(sendTemperature, 2000, mqttClient);

function sendTemperature(client){	

  console.log("Sending event");

	var t = {
		T: Math.random() * 100,
		Units: "C"
	};

  //publish on the "temperature" topic
	client.publish('temperature', JSON.stringify(t));
}
