var mqtt = require('mqtt')
  , host = 'localhost'
  , port = '9999';

var settings = {
  keepalive: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clientId: 'Reader-1',
  username:'readerUsername',
  password:'readerPassword'
}

// client connection
var client = mqtt.createClient(port, host, settings);

//topic
client.subscribe('temperature');

client.on('message', function(topic, message) {

  if(topic ==='temperature')
  {
    console.log('New reading', message);
  }
});