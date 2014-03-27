var request = require('request');
var jwt = require('jsonwebtoken');

function Auth0Mosca(auth0Namespace, clientId, clientSecret, connection)
{
  this.auth0Namespace = auth0Namespace;
  this.connection = connection;
  this.clientId = clientId;
  this.clientSecret = clientSecret;
}

Auth0Mosca.prototype.authenticate = function(){

  var self = this;

  return function(client, username, password, callback) {

	   var data = {
    		client_id:   self.clientId, // {client-name}
    		username:    username,
    		password:    password,
    		connection:  self.connection,
    		grant_type:  "password",
    		scope: 'openid profile'
  	};

  	request.post({
    		headers: {
                "Content-type": "application/json"
            },
    		url: self.auth0Namespace + '/oauth/ro',
    		body: JSON.stringify(data)
    	}, function(e,r,b){
    		if(e){ 
    			console.log('Error in Authentication');
    			return callback(e,false);
    		}
    		var r = JSON.parse(b);

    		if( r.error ) { return callback( r, false); } 

        jwt.verify(r.id_token, new Buffer(self.clientSecret, 'base64'), function(err,profile){
          if( err ) { return callback("Error getting UserInfo", false); }
          client.deviceProfile = profile;
          return callback(null, true);
        });
  	});
  }
}

Auth0Mosca.prototype.authorizePublish = function() {
  return function (client, topic, payload, callback) {
	 callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
  }
}

Auth0Mosca.prototype.authorizeSubscribe = function() {
  return function(client, topic, callback) {
  callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1);
  }
}

module.exports = Auth0Mosca;
