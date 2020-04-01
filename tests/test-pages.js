var expect = require('chai').expect;
var request = require('request');
var should = require('should');


// test the login page 
it('Main page', function(done) {
    request('http://localhost:3000', function(error, response, body) {
        response.statusCode.should.equal(200);
        done();
    });
});

// test the home page without logging in
it('home page', function(done) {
    request('http://localhost:3000/home', function(error, response, body) {
        should.equal(body, "Please log in to view this page");
        done();
    });
});
