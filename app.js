const express = require('express');
const app = express();

app.post('/handle_call', function (req, res) {
    //res.send('Hello World!')
});

app.post('/call_room', function (req, res) {
    res.send('Hello World!')
});

app.listen(3000, function () {
    console.log('App is listening on port 3000!')
});
