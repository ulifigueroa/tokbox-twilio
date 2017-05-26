const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const app = express();

app.get('/', function (request, response) {
    response.send('It is working!')
});

app.post('/handler', function (request, response) {
    const twiml = new VoiceResponse();
    const gatherNode = twiml.gather({numDigits: 4}, action: '/hanlder');

    if (request.body && request.body.Digits) {
        twiml.say({voice: 'alice'}, 'I\'m connecting you to the Live Interview, please wait a moment.');
        twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');
    } else {
        gatherNode.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
        twiml.redirect('/handler');
    }

    response.type('text/xml');
    response.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
