/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let threadOne;
  let threadTwo;
  let reply;
  let text = ' Hi';

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('Create 2 new threads', done => {
        chai.request(server)
          .post('/api/threads/app-test')
          .send({
            text: 'Test',
            delete_password: 'secret'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
          });
        chai.request(server)
          .post('/api/threads/app-test')
          .send({
            text: 'Test 2',
            delete_password: 'secret'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
    });
    
    suite('GET', function() {

      test('List threads', done => {
        chai.request(server)
          .get('/api/threads/app-test')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);
            threadOne = res.body[0]._id;
            threadTwo = res.body[1]._id;
            done();
          });
      });

    });
    
    suite('DELETE', function() {

      test('correct password', done => {
        chai.request(server)
        .delete('/api/threads/app-test')
        .send({
          thread_id: threadOne, 
          delete_password:'secret'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });

      test('wrong password', done => {
        chai.request(server)
        .delete('/api/threads/app-test')
        .send({
          thread_id: threadTwo, 
          delete_password:'known'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
    });
    
    suite('PUT', function() {

      test('Report a thread', done => {
        chai.request(server)
        .put('/api/threads/app-test')
        .send({
          report_id: threadTwo
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('reply to thread', done => {
        chai.request(server)
        .post('/api/replies/app-test')
        .send({
          thread_id: threadTwo, 
          text:'a reply' + text, 
          delete_password:'secret'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);

          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('Get all replies', done => {
        chai.request(server)
        .get('/api/replies/app-test')
        .query({
          thread_id: threadOne
          })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.property(res.body.replies[0], 'delete_password');
          assert.property(res.body.replies[0], 'reported');
          assert.equal(res.body.replies[0].text, 'a reply' + text);
          reply = res.body.replies[0]._id;
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('Report a reply', done => {
        chai.request(server)
        .put('/api/replies/app-test')
        .send({
          thread_id: threadOne,
          reply_id: reply
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('Delete reply with wrong password', done => {
        chai.request(server)
        .delete('/api/replies/app-test')
        .send({
          thread_id: threadOne,
          reply_id: reply,
          delete_password: 'known'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with valid password', done => {
        chai.request(server)
        .delete('/api/replies/app-test')
        .send({
          thread_id: threadOne,
          reply_id: reply,
          delete_password: 'secret'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
    });
    
  });

});
