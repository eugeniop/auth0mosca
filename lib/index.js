var request = require('request');
var jwt = require('jsonwebtoken');


/**
 * @param domain your Auth0 domain
 * @param clientId your Auth0 client id
 * @param connection Auth0 connection (user store) you want to use
 * @param jwtOptions object with options to use while verifying JWT token
 * @param secretOrPublicKey your Auth0 client secret or public key depending
 *      on the used algorithm
 */
function Auth0Mosca(domain, clientId, connection, jwtOptions,
    secretOrPublicKey) {

    this.domain = domain.indexOf('://') != -1 ? domain : 'https://' + domain;
    this.connection = connection;
    this.clientId = clientId;
    this.jwtOptions = jwtOptions;
    this.secretOrPublicKey = secretOrPublicKey;
}

/**
 * Used to authenticate MQTT users with a JWT token. username must be 'JWT' and
 * password must be the JWT token
 */
Auth0Mosca.prototype.authenticateWithJWT = function() {

    var self = this;

    return function(client, username, password, cb) {

        if (username !== 'JWT') {
            return cb("Invalid Credentials", false);
        }

        jwt.verify(password.toString(), self.secretOrPublicKey,
            self.jwtOptions,
            function(err, profile) {
                console.log(err);
                if (err) {
                    return cb("Error getting UserInfo", false);
                }

                client.deviceProfile = profile;
                return cb(null, true);
            });
    };
};

/**
 * Used to authenticate MQTT users with the credentials.
 */
Auth0Mosca.prototype.authenticateWithCredentials = function() {

    var self = this;

    return function(client, username, password, cb) {

        var data = {
            client_id: self.clientId,
            username: username,
            password: password.toString(),
            connection: self.connection,
            grant_type: 'password',
            scope: 'openid profile'
        };

        request.post({
            headers: {
                "Content-type": "application/json"
            },
            url: self.domain + '/oauth/ro',
            body: JSON.stringify(data)
        }, function(err, res, body) {
            if (err) {
                return cb(err, false);
            }

            var res = JSON.parse(body);

            if (res.error) {
                return cb(res, false);
            }

            jwt.verify(res.id_token, self.secretOrPublicKey,
                self.jwtOptions,
                function(err, profile) {
                    console.log(err);
                    if (err) {
                        return cb("Error getting UserInfo", false);
                    }

                    client.deviceProfile = profile;
                    return cb(null, true);
                });
        });
    };
};

/**
 * Check if this device is allowed to publish for topic. Allowed topics must be
 * set in a field topics under user_metadata as an array of topics or a ':'
 * separated string (eg: "topic1:topic2").
 */
Auth0Mosca.prototype.authorizePublish = function() {

    var self = this;

    return function(client, topic, payload, cb) {

        if (client.deviceProfile && client.deviceProfile.user_metadata &&
            client.deviceProfile.user_metadata.topics) {

            var topics = client.deviceProfile.user_metadata.topics;
            if (typeof topics === 'string' || topics instanceof String)
                topics = topics.split(":");

            return cb(null, topics.indexOf(topic) > -1)
        }

        cb(null, false);
    };
};

/**
 * Check if this device is allowed to subscribe for topic. Allowed topics must
 * be set in a field topics under user_metadata as an array of topics or a ':'
 * separated string (eg: "topic1:topic2").
 */
Auth0Mosca.prototype.authorizeSubscribe = function() {

    var self = this;

    return function(client, topic, cb) {

        if (client.deviceProfile && client.deviceProfile.user_metadata &&
            client.deviceProfile.user_metadata.topics) {

            var topics = client.deviceProfile.user_metadata.topics;
            if (typeof topics === 'string' || topics instanceof String)
                topics = topics.split(":");

            return cb(null, topics.indexOf(topic) > -1)
        }

        cb(null, false);
    };
};

module.exports = Auth0Mosca;
