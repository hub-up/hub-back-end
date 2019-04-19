'use strict';

const jest = require('jest');
const io = require('socket.io-client');
const assert = require('assert');
const should = require('should');
// const chai = require('chai');
// const expect = chai.expect();
const expect = require('expect');
const events = require('../../../src/api/v1.events.js');
// const io_server = require('socket.io').listen(3000);//listens on 

//dummy user for tests
const chatUser1 = 'AARON';
const chatUser2 = 'BRUCE';


//In terminal using mocha type:
//~$ mocha __tests__/src/api
//OR
//~$mocha --recursive __tests__
describe('manage each socket connection and disconnection', () => {
  const socketURL = 'http://localhost:3000';//hard coded local url
  const options = {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
  };
  //management for each socket to ensure connect and disconnect
  let socket;
  
  beforeEach((done) => {
    socket = io.connect(socketURL, options);
    socket.on('connect', () => {
      console.log('TEST CONNECTION ESTABLISHED');
      done();
    });
    socket.on('disconnect', () => {
      console.log('TEST CONNECTION TERMINATED');
    });
  });
  
  afterEach((done) => {
    if(socket.connected){
      console.log('TEST CONNECTION is being TERMINATED');
      socket.disconnect();
    } else {
      console.log('THERE IS NO CONNECTION TO TERMINATE');
    }
    socket.close();//disconnects the socket when all tests are completed
    done();//declares finished
    io_server.close();//closes the server when all tests are completed
  });
  
  
  //tests for actual events
  describe('events handler', () => {
    
    xit('should return with a new user payload on login', (done) => {
      let client1 = io.connect(socketURL, options);
      // console.log(client1);//is the socket
      client1.on('connect', (payload) => {
        console.log('hit1');
        payload = {message: '', username: chatUser1 };
        client1.emit('login', payload);
        console.log('hit2');
        //upper part of this test works. lower part does not
        io_server.emit('login', events.payload);
        socket.on('login', (payload) => {
          console.log('payloadHIT: ', payload);
          expect(payload.username).toBe('AARON');
          expect(payload.messsage).toBe('');
          expect(payload.room).toBe('lobby');
        });
      });
      // client1.emit('login', payload);
      // console.log(payload);
      // client1.on('login-io', (payload) => {//not hitting this
      //   console.log('hit again');
      //   expect(payload.username).toBe('AARON');
      //   expect(payload.message).toBe('');
      // });
      // console.log('loginClient: ', payload);
      done();
    });
    
    //WORKS
    xit('should return the payload object when any user types in a normal chat message', (done) => {
      console.log('chat TEST TRIGGERING');
      // assert.equal(payload, );
      socket.emit('chat', 'Hello World');
      socket.once('chat', (message) => {
        expect(message).toBe('Hello World');
        console.log('message: ', message);
        done();
      });
    });
    
    //WORKS
    it('should return the user details info', (done) => {
      let client1 = socket;
      let payload = {message: '', username: chatUser1, room: 'lobby'};
      client1.emit('login', payload);
      console.log('payload: ', payload);
      console.log('socketID: ', client1.id);
      let user = {username: chatUser1, socketId: client1.id, room: 'lobby'};
      client1.emit('details', user);
      console.log('user: ', user);
        
      socket.on('details-io', (payload) => {
        console.log('payload: ', payload);
      });
      done();
    });
      
      
      
      
  });
});
  