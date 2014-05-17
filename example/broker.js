var mosca = require('mosca')
var Auth0Mosca = require('../../auth0mosca');

var settings = {
  port: 9999,
};

var auth0 = new Auth0Mosca('https://yourcompany.auth0.com', 'q1OsLQy...cBOTJzwZdQniR', 'IOG1LGRRO8c....SfTF8j1le','Thermostats');

//Setup the Mosca server
var server = new mosca.Server(settings);

//Wire up Authentication & Authorization
server.authenticate = auth0.authenticateWithCredentials();
//server.authenticate = auth0.authenticateWithJWT();

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