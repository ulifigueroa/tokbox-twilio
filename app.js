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

app.post('/debug', function (request, response) {
    console.log('Debugging Webhook.')

    console.log('request', request);

    response.send(200);
});

// This handles the incoming Tokbox SIP call. What we need to do here is to
// call to the queue to link the PSTN call and this incoming call.
//
// NOTE: queueName has to be unique for each live interview, we need to generate
// a unique code less that 64 characters, we cannot use Tokbox session id since
// it's longer than 64 chars. For testing purposes let's use just 'live_interview'.
app.post('/sip', function (request, response) {
    var twiml = new VoiceResponse(),
        queueName = 'live_interview';

    twiml.dial().queue({}, queueName);

    response.type('text/xml');
    response.send(twiml.toString());
});

// This handles the incoming PSTN call,
// and ask for the Live Interivew code.
app.post('/pstn', function (request, response) {
    var twiml = new VoiceResponse();
    var gather = twiml.gather({numDigits: 4, action: '/gather'});

    gather.say({voice: 'alice'}, 'Welcome to your Live interview, please enter the four digits code.');
    twiml.redirect('/pstn');

    response.type('text/xml');
    response.send(twiml.toString());
});

// This handles the action when the user enters the code. If the code is not
// valid we return to the 'pstn' function where we ask for the user to enter it
// again.
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

// This function just plays a cool song while the call is on the queue
// waiting for the Tokbox SIP call to be created.
app.post('/wait', function (request, response) {
    var twiml = new VoiceResponse();

    twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');

    response.type('text/xml');
    response.send(twiml.toString());
});

// This enqueues the current PSTN call while the Tokbox SIP call is created.
app.post('/enqueue', function (request, response) {
    var twiml = new VoiceResponse(),
        queueName = 'live_interview';

    twiml.enqueue({waitUrl: '/wait'}, queueName);

    response.type('text/xml');
    response.send(twiml.toString());
});

// This creates the Tokbox SIP call.
wepow.callTwilio = function() {
    var token = opentok.generateToken(process.env.OPENTOK_SESSION_ID, {role: 'publisher', data: '{"sip":true}'});
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
