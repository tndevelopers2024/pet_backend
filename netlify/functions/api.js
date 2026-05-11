require('dotenv').config();
const serverless = require('serverless-http');
const { connectDB } = require('../../src/db/connection');
const app = require('../../src/index');

let isConnected = false;

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return serverless(app)(event, context);
};

module.exports = { handler };
