const express = require('express');
const app = express();

app.get('/', function (request, response) {
    response.send('It is working!')
});

app.post('/handler', function (request, response) {
    console.log('request', request);
    response.send('It is working!')
});

app.listen(process.env.PORT || 3000, function () {
    console.log('App is listening on port 3000!')
});
