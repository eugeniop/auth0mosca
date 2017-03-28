var jwksRsa = require('jwks-rsa');
var mosca = require('mosca');
require('dotenv').config();
var Auth0Mosca = require('../../auth0mosca');

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
