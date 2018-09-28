'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { PORT, MONGODB_URI } = require('./config');

const foldersRouter = require('./routes/folders');
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

// Create an Express application
const app = express();

// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());
app.use((req,res,next) => {
  console.log("I am here", req.body);
  next();
});
// Mount routers
app.use('/api/folders', foldersRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/login', authRouter);


// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if(require.main === module) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error(err);
    });

 
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
  

}

module.exports = app; // Export for testing