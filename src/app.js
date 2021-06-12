const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');

// routers
const appRouter = require('./routers/appRouter');

const app = express();
app.use(helmet());
app.use(cors());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.use(express.json());
app.use(appRouter);

module.exports = app;
