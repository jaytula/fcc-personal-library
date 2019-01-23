/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

let SAVEDBOOKID
const INVALIDID='ffffffffffffffffffffffff'
chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server).post('/api/books')
          .send({title: 'Adventures of Lilac'})
          .end(function(err, res) {
             assert.equal(res.status, 200, 'Response Code should be 200 OK')
             assert.property(res.body, 'title')
             assert.property(res.body, '_id')
             SAVEDBOOKID = res.body._id
             done()
           })
      }); 
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server).post('/api/books')
          .send({})
          .end(function(err, res) {
             assert.equal(res.status, 400, 'Expecting 400 Bad Request')
             assert.equal(res.body.status, 'fail')
             assert.equal(res.body.data, 'title is missing')
             done()
           })
      });
      
    });

    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done) {
        chai.request(server).get('/api/books').end((err, res) => {
          assert.equal(res.status, 200, 'Response Code should be 200 OK')
          assert.isArray(res.body)
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done()
        })
      });      
      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server).get(`/api/books/ffffffffffffffffffffffff`).end((err, res) => {
          assert.equal(res.status, 400)
          assert.equal(res.text, 'no book exists')
          done()
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server).get(`/api/books/${SAVEDBOOKID}`).end((err, res) => {
          assert.equal(res.status, 200, 'Response Code should be 200 OK')
          assert.property(res.body, 'comments');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.property(res.body, '_id', 'Books in array should contain _id');
          done()
        })
      });
      
    });
 
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server).post(`/api/books/${SAVEDBOOKID}`)
        
          .send({comment: 'a comment'}).end((err, res) => {
          assert.equal(res.status, 200, 'Response Code should be 200 OK')
          assert.property(res.body, 'comments');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.property(res.body, '_id', 'Books in array should contain _id');
          assert.isTrue(res.body.comments.length > 0, 'There should be at least 1 comment')
          done()
        })
      });
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server).post(`/api/books/${INVALIDID}`)
        
          .send({comment: 'a comment'}).end((err, res) => {
          assert.equal(res.status, 400, 'Response Code should be 200 OK')
          done()
        })
      });
      
    });

  });

});
