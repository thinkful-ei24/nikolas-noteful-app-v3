const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
const Folders = require('../models/folders');
const Tag = require('../models/tags');
const passport = require('passport');
router.use(passport.authenticate('jwt', { session: false, failWithError: true })); 


const validateTagsIdTest = function(req, res, next) {

  let { tags } = req.body; 
  let userId = req.user.id;
  if(!(tags)) {
    return next();
  }  
          
  if(tags) {
    tags.forEach(tag =>{
      console.log(tag);
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('Bad tag!');
        err.status = 404;
        return next(err);
      }
    });
        
    Tag.find({_id: {$in: tags}, userId}).count()
      .then(tagCount => {
        console.log(tagCount);
        if(tagCount !== tags.length) {
          const err = new Error('An id in `tags` does not exist.');
          err.status = 404;
          return next(err);
        }
      });
  }
  return next();
      
};

module.exports = { validateTagsIdTest };


