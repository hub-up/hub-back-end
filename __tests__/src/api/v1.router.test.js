'use strict';

const path = require('path');

const supertest = require('supertest');

const { app } = require(path.resolve('src/server.js'));
const mockClient = supertest(app);

describe('rootHandler', () => {
  it('responds with a 200 on a good route', async () => {
    try {
      const results = await mockClient.get('/');
      expect(results.status).toBe(200);
    } catch (err) {
      console.error(err);
    }
  });
});
