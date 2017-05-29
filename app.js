var express = require('express');
var parser = require('body-parser');
var request = require('request');
var app = express();

var OpenTok = require('opentok');
var opentok = new OpenTok(process.env.OPENTOK_API_KEY, process.env.OPENTOK_API_SECRET);
var VoiceResponse = require('twilio').twiml.VoiceResponse;

app.use(parser.urlencoded({extended: false}));
app.use(parser.json());

app.get('/', function (request, response) {
    response.send('It is working!');
});

app.post('/voice', function (request, response) {
    var twiml = new VoiceResponse();
    var gather = twiml.gather({numDigits: 4, action: '/gather'});

    gather.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
    twiml.redirect('/voice');

    response.type('text/xml');
    response.send(twiml.toString());
});

app.post('/gather', function (request, response) {
    var twiml = new VoiceResponse();

    if (request.body.Digits) {
        twiml.say({voice: 'alice'}, 'I\'m connecting you to the Live Interview, please wait a moment.');
        twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');

        var token = opentok.generateToken(process.env.OPENTOK_SESSION_ID);

        var options = {
            url: 'https://api.opentok.com/v2/project/' + process.env.OPENTOK_API_KEY + '/dial',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-OPENTOK-AUTH': {
                    iss: process.env.OPENTOK_API_KEY,
                    ist: 'project',
                    iat: Date.now(),
                    exp: Date.now() + (60 * 1000),
                    jti: 'jwt_nonce'
                }
            }
        };

        var body = {
            sessionId: process.env.OPENTOK_SESSION_ID,
            token: token,
            sip: {
                uri: 'sip:test@wepow-live.sip.twilio.com',
                headers: {
                  'headerKey': 'headerValue'
                },
                auth: {
                  'username': 'username',
                  'password': 'password'
                },
                secure: false
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body);
            }
        });
    } else {
        twiml.redirect('/voice');
    }

    response.type('text/xml');
    response.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
