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
// Test
var findImages = require('./lib/findimages');

app.get('/test', function (req, res) {
    console.log(findImages.find());
    res.send(findImages.find());
});


app.get('/', function (req, res) {
    res.sendFile('index.html');
});


// Get timestamp before database recording: var timestamp = new Date().toISOString();

// Example: http://localhost:8000/api/search?term=lake&offset=13
app.get('/api/search', function (req, res) {
    console.log(req.query) // should return the query string
    var searchTerm = req.query.term;
    console.log("Searching for: ", searchTerm);
    var offset = req.query.offset | 0;
    //console.log(req.query.term, req.query.offset);   

    if (searchTerm) {        
        client.search(searchTerm).then(images => {
           // console.log(images);            
            res.json(images);
        });
        
        // log search term to database        
        var now = new Date();
        var date = now.toISOString();
        database.collection('log').insert( { term: searchTerm, when: date } );

    } else {
        console.log('No search term')
        res.send('No search term');
    }

    // console.log('Search for: ', searchTerm);
    //console.log('Offset: ', offset);    
    // var output = JSON.stringify(req.params);
    // console.log("Term: " + JSON.stringify(req.params));
    
    //res.send(req.params);
    //res.send('search ' + req.params.term + 'offset: ' + req.params.offset );    
});

app.get('/api/latest', (req, res) => {
    database.collection('log').find({}, {
        _id: 0
    }).limit(10).toArray(function (err, result) {
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
