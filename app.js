var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

app.use(express.static('public'));

var GoogleImages = require('google-images');
var credentials = require('./config/credentials');

var client = new GoogleImages(credentials.cseId, credentials.apiKey);

client.search('dogs')
    .then(images => {        
        console.log(images);
    });

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

// Return 404 on missing pages
app.get('*', function (req, res) {
    res.status(404).send('Error: 404. Page not found !');
});

// Error handler
app.use(function (err, req, res, next) {
    // if URIError occurs
    if (err instanceof URIError) {
        err.message = 'Failed to decode param at: ' + req.url;
        err.status = err.statusCode = 400;
        return res.send('Error: ' + err.status + '<br>' + err.message);
    } else {
        // More errors...
    }
    next();
});

app.listen(port, console.log('Listening on port:', port));
