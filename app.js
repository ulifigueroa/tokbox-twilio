var wepow = {};
var express = require('express');
var parser = require('body-parser');
var app = express();
var OpenTok = require('opentok');
var opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
var VoiceResponse = require('twilio').twiml.VoiceResponse;
var twiml = new VoiceResponse();

app.use(parser.urlencoded({extended: false}));
app.use(parser.json());

app.get('/', function (request, response) {
    response.send('It is working!');
});

app.post('/sip', function (request, response) {
    console.log('Queue');
    twiml.dial().queue({workflowSid: process.env.OPENTOK_SESSION_ID});

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/pstn', function (request, response) {
    var gather = twiml.gather({numDigits: 4, action: '/gather'});

    gather.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
    twiml.redirect('/pstn');

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/gather', function (request, response) {
    if (request.body.Digits) {
        wepow.callTwilio();
        twiml.say({voice: 'alice'}, 'I\'m connecting you to the Live Interview, please wait a moment.');

        console.log('enqueue');
        twiml.enqueue({
            workflowSid: process.env.OPENTOK_SESSION_ID,
            waitUrl: 'https://demo.twilio.com/docs/classic.mp3'
        });
    } else {
        console.log('Redirect PSTN');
        twiml.redirect('/pstn');
    }

    response.type('text/xml');
    response.send(twiml.toString());
});

wepow.callTwilio = function() {
    var token = opentok.generateToken(process.env.OPENTOK_SESSION_ID);

    opentok.dial(process.env.OPENTOK_SESSION_ID, token, process.env.TWILIO_SIP_URI, {
        auth: {
            username: process.env.TWILIO_SIP_USER,
            password: process.env.TWILIO_SIP_PASSWORD,
        },
        headers: {}
    }, function (err, sipCall) {
        if (err) {
            console.error(err);
        }

        console.dir(sipCall);
    });
};

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
