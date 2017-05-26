const express = require('express');
const twilio = require('twilio');
const app = express();

app.get('/', function (request, response) {
    response.send('It is working!')
});

app.post('/handler', function (request, response) {
    let twiml = new twilio.TwimlResponse();
    twiml.say('Welcome to your Live interview, please enter the code.', { voice: 'alice' });
    response.type('text/xml');
    response.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
