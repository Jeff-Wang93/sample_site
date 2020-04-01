const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

const express = require('express');
const router = express.Router()
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');


// get a uuid from npm-uuid
var uuid = require('uuid');

// salt/hash functionality
var bcrypt = require('bcrypt');
const saltRounds = 10;

// initilize express framework
var app = express();

// enable cookies/sessions
app.use(session({
    secret: 'test_secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// serve static resources
app.use(express.static(__dirname + '/views'));
// index page
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/views/index.html'));
});

// sign up route
app.post('/signup', function(request, response) {
    // ensure user doesn't already exist
    query = db.get('users').find({email: request.email}).value();
    if(query) {
        response.send('User already exists');
    }
    
    else {
        req = request.body;
        // create a hash
        bcrypt.hash(req.password, saltRounds, function(err, hash) {
            db.get('users').push({ guid: uuid.v4(),
                                   isActive: true,
                                   balance: 0,
                                   picture: req.picture,
                                   age: req.age,
                                   eyeColor: req.eye,
                                   name: {
                                       first: req.fname,
                                       last: req.lname
                                   },
                                   company: req.company,
                                   email: req.email,
                                   phone: req.phone,
                                   address: req.address,
                                   hash: hash }
            ).write()

            // login the user and send them to the home page
            request.session.loggedin = true;
            query = db.get('users').find({email: req.email}).value();
            request.session.user = query;
            return response.redirect('/home');
        });
    }
});

// edit route
// very similar to signup, could make more modular, dont want to violate DRY
// functionality requires all fields be changed at once
app.post('/edit', function(request, response) {
    req = request.body;
    bcrypt.hash(req.password, saltRounds, function(err, hash) {
        db.get('users').find({guid: request.session.user.guid}).assign({ 
            balance: req.balance,
            picture: req.picture,
            age: req.age,
            eyeColor: req.eye,
            name: {
                first: req.fname,
                last: req.lname
            },
            company: req.company,
            email: req.email,
            phone: req.phone,
            address: req.address,
            hash: hash }
        ).write()

        // login the user and send them to the home page
        request.session.loggedin = true;
        query = db.get('users').find({email: req.email}).value();
        request.session.user = query;
        return response.redirect('/home');
    });
});


// deal with authentication, redirect to home page on success
app.post('/auth', function(request, response) {
    // enable session/cookie functionality
    var uname = request.body.username;
    var pword = request.body.password;

    if (uname && pword) {
        query = db.get('users').find({email: uname}).value();

        // ensure user exists
        if(query) {
            // check the plain text password with the db hash
            bcrypt.compare(pword, query.hash, function(err, result) {
                if(result) {
                    request.session.loggedin = true;
                    request.session.user = query;
                    response.redirect('/home');
                }

                else {
                    // need nicer UI experience rather than plain text on screen. modal?
                    response.send('Incorrect username or password');
                }
            });
        }
        else {
            response.send('User not found');
        }
    }
});

// user info page
app.get('/home', function(request, response) {
    if(request.session.loggedin) {
        response.render('home', query);
    }
    else {
        response.send('Please log in to view this page');
    }
});

app.get('/logout', function(request, response) {
    if(request.session.loggedin) {
        request.session.loggedin = false;
        response.redirect('/');
    }
    else {
        response.send('Not logged in');
    }
});


app.listen(3000);
