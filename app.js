var wepow = {};
var express = require('express');
var parser = require('body-parser');
var app = express();
var OpenTok = require('opentok');
var opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
var VoiceResponse = require('twilio').twiml.VoiceResponse;

app.use(parser.urlencoded({extended: false}));
app.use(parser.json());

app.get('/', function (request, response) {
    response.send('It is working!');
});

app.post('/sip', function (request, response) {
    var twiml = new VoiceResponse();

    twiml.say({voice: 'alice'}, 'I\'m connecting you to the Live Interview.');
    twiml.dial().queue({}, 'live_interview');

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/pstn', function (request, response) {
    var twiml = new VoiceResponse();
    var gather = twiml.gather({numDigits: 4, action: '/gather'});

    gather.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
    twiml.redirect('/pstn');

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/gather', function (request, response) {
    var twiml = new VoiceResponse();

    if (request.body.Digits) {
        wepow.callTwilio();
        twiml.redirect('/enqueue');
    } else {
        twiml.redirect('/pstn');
    }

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/enqueue', function (request, response) {
    var twiml = new VoiceResponse();

    twiml.enqueue({waitUrl: 'https://demo.twilio.com/docs/classic.mp3'}, 'live_interview');

    response.type('text/xml');
    response.send(twiml.toString());
});

wepow.callTwilio = function() {
    var token = opentok.generateToken(process.env.OPENTOK_SESSION_ID);
    var options = {
            headers: {},
            auth: {
                username: process.env.TWILIO_SIP_USER,
                password: process.env.TWILIO_SIP_PASSWORD,
            }
        };

    opentok.dial(process.env.OPENTOK_SESSION_ID, token, process.env.TWILIO_SIP_URI, options, function (error, sipCall) {
        if (error) {
            console.error('Error making Tokbox SIP call.', error);
        } else {
            console.log('Tokbox SIP call created successfully.');
        }
    });
};

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
