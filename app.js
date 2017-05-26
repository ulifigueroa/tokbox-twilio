const express = require('express');
const parser = require('body-parser')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const app = express();

app.use(parser.urlencoded({extended: false}));
app.use(parser.json());

app.get('/', function (request, response) {
    response.send('It is working!')
});

app.post('/voice', function (request, response) {
    const twiml = new VoiceResponse();
    const gather = twiml.gather({numDigits: 4, action: '/gather'});

    gather.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
    twiml.redirect('/voice');

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/gather', function (request, response) {
    const twiml = new VoiceResponse();

    if (request.body.Digits) {
        twiml.say({voice: 'alice'}, 'I\'m connecting you to the Live Interview, please wait a moment.');
        twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');
    } else {
        twiml.redirect('/voice');
    }

    response.type('text/xml');
    response.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
