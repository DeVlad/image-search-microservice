var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

app.use(express.static('public'));

// MongoDB
var MongoClient = require('mongodb').MongoClient;
var database;
var url = process.env.MONGODB_URI;
// var url = 'mongodb://localhost:27017/image-search';

// Use connect method to connect to the Server 
MongoClient.connect(url, function (err, db) {
    if (!err) {
        console.log('Database connection established');
        database = db;
    } else {        
        console.log('Database connection failed');
        //throw err;
    }
});

// Image search
var GoogleImages = require('google-images');
var client = new GoogleImages(process.env.CSE_ID, process.env.API_KEY);

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

// Example: http://localhost:8000/api/search?term=lake&offset=13
app.get('/api/search', function (req, res) {
    var searchTerm = req.query.term;
    var offset = req.query.offset | 0;
    if (searchTerm) {
        client.search(searchTerm, {page: offset}).then(function (images) {                    
            res.json(images);
        });        
        // log search term to database        
        var now = new Date();
        var date = now.toISOString();
        database.collection('log').insert( { term: searchTerm, when: date } );
    } else {
        //console.log('No search term');
        res.send('No search term');
    }
});

app.get('/api/latest', function (req, res) {
    // Display latest 10 documents from log
    database.collection('log').find({}, {
        _id: 0
    }).sort({$natural:-1}).limit(10).toArray(function (err, result) {
        if (err) throw err;        
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