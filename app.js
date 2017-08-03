var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

app.use(express.static('public'));

// MongoDB
var MongoClient = require('mongodb').MongoClient;
var database;
var url = 'mongodb://localhost:27017/image-search';
// Use connect method to connect to the Server 
MongoClient.connect(url, function (err, db) {
    if (!err) {
        console.log('Database connection established');
        database = db;
    }
});

// Image search
var GoogleImages = require('google-images');
var credentials = require('./config/credentials');
var client = new GoogleImages(credentials.cseId, credentials.apiKey);

// Sample image search
//client.search('dogs')
//    .then(images => {
//        console.log(images);
//    });

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/api/latest', (req, res) => {
    database.collection('log').find({},{ _id: 0 }).limit(10).toArray(function (err, result) {
        if (err) throw err
        //console.log(result)
        res.json(result);
    });
});

// Redirect to main page
app.get('/api', function (req, res) {
    res.redirect('/');
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
