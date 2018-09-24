const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');



router.post('/', (req,res,next) => {

  console.log(req.body);

  const {username, password, firstName, lastName} = req.body;
  let fullname;

  

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  if(username.trim() !== username || password.trim() !== password) {
    const err = new Error('Either your password or username contain spaces!');
    err.status = 404;
    next(err);
  }

  if(username.length < 1) {
    const err = new Error('Username has to be at least 1 character!');
    err.status = 404;
    next(err);
  }

  if(password < 8 || password > 72) {
    const err = new Error('Password does not meet required length. (At least 8 characters and no more than 72)');
    err.status = 404;
    next(err);
  }


  if(firstName && lastName) {
    fullname = `${firstName} ${lastName}`;
  }
  
  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      console.log(newUser);
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      console.error(err);
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});


module.exports = router;