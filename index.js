'use strict';

const PORT = process.env.PORT || 3000;
const { start } = require('./src/server.js');

start(PORT);
