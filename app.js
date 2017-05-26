const express = require('express');
const twilio = require('twilio');
const app = express();

app.get('/', function (request, response) {
    response.send('It is working!')
});

app.post('/handler', function (request, response) {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();
    twiml.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the code.');

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
