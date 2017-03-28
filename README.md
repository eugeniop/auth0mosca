auth0mosca
==========

An authentication/authorization module for mosca using Auth0.

See [this article for details](https://docs.auth0.com/scenarios-mqtt).

![](https://docs.google.com/drawings/d/1hMahWH3Q0YBs5vT8Ubl-uLgvkcoo5f6Q0crMHbAqi6k/pub?w=854&h=521)

###Setting up mosca server

```
var jwksRsa = require('jwks-rsa');
var mosca = require('mosca');
require('dotenv').config();
var Auth0Mosca = require('auth0mosca');

var settings = {
  port: 9999,
};

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID ||
    !process.env.AUTH0_CONNECTION) {
    throw 'Make sure you have AUTH0_DOMAIN, AUTH0_CLIENT_ID' +
        ' and AUTH0_CONNECTION in your .env file';
}

// options for JWT verification
const jwtOptions = {
    // Validate the audience and the issuer.
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
};

const jwtClient = jwksRsa({
    strictSsl: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

jwtClient.getSigningKeys(function(err, keys) {

    var publicKey = keys[0].publicKey || keys[0].rsaPublicKey;

    startServer(publicKey);
});

function startServer(publicKey) {

    var auth0 = new Auth0Mosca(process.env.AUTH0_DOMAIN,
        process.env.AUTH0_CLIENT_ID, process.env.AUTH0_CONNECTION, jwtOptions,
        publicKey);

    const server = new mosca.Server(settings);

    // delegate auth tasks of Mosca on Auth0Mosca
    server.authenticate = auth0.authenticateWithCredentials();
    server.authorizePublish = auth0.authorizePublish();
    server.authorizeSubscribe = auth0.authorizeSubscribe();

    // fired when a client establishes a connection
    server.on('clientConnected', function(client) {
        console.log('New connection: ', client.id);
    });

    // fired when a message is received
    server.on('published', function(packet, client) {
        console.log('Published', packet.payload);
    });

    server.on('ready', setup);
}

// MQTT server is ready
function setup() {
    console.log('Mosca server is up and running');
}

```

The client:

```
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

```

The .env file:

```
AUTH0_CLIENT_ID=Your client id
AUTH0_DOMAIN=Your domain
AUTH0_CONNECTION=Your user store

```

Notice that the `auth0Mosca` module also supports authetnicating with Json Web Tokens directly. Devices will obtain JWT independently and send it on the `password` field. In this case `username` must be `JWT` by convention.

License
=======

MIT
