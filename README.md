auth0mosca
==========

An authentication/authorization module for mosca using Auth0.

See [this article for details](https://docs.auth0.com/scenarios-mqtt). 

![](https://docs.google.com/drawings/d/1hMahWH3Q0YBs5vT8Ubl-uLgvkcoo5f6Q0crMHbAqi6k/pub?w=854&h=521)

###Setting up mosca server

```
var mosca = require('mosca')
var Auth0Mosca = require('./auth0Mosca');

var settings = {
  port: 9999,
};

var auth0 = new Auth0Mosca('https://eugeniop.auth0.com', '{AUTH0 CLIENT ID}', '{AUTH0 CLIENT SECRET}','Thermostats');

//Setup the Mosca server
var server = new mosca.Server(settings);

//Wire up Authentication & Authorization
server.authenticate = auth0.authenticateWithCredentials(); //Using usr/pwd
server.authorizePublish = auth0.authorizePublish();
server.authorizeSubscribe = auth0.authorizeSubscribe();

server.on('ready', setup);

// Fired when the mqtt server is ready
function setup() {
  	console.log('Mosca server is up and running');
}

server.on('clientConnected', function(client) {
  console.log('New connection: ', client.id );
});

```

The client:

```
var mqtt = require('mqtt')
  , host = 'localhost'
  , port = '9999';

var settings = {
  keepalive: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clientId: 'Thermostat 1a',
  username:'the device username',
  password: 'the device password'
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

	client.publish('temperature', JSON.stringify(t));
}
```

Notice that the `auth0Mosca` module also supports authetnicating with Json Web Tokens directly. Devices will obtain JWT independently and send it on the `password` field. In this case `username` must be `JWT` by convention.

License
=======

MIT
