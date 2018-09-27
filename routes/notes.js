'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
const Folders = require('../models/folders');
const Tag = require('../models/tags');
const passport = require('passport');
router.use(passport.authenticate('jwt', { session: false, failWithError: true })); 
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  let {searchTerm, folderId, tagId} = req.query;
  const userId = req.user.id;

  console.log(req.params);
  
  let filter = {};

  filter.userId = userId;
  //we created a filter object and a regular expression variable outside so in our filter object everything is conclusive and easily accessible in terms of adding onto or removing
  
  const re = new RegExp(searchTerm, 'gi');

  if (searchTerm) { 
    filter = { $or: [{title: re}, {content: re}]};
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId ;
  }
  
  console.log(filter.userId);

  return Note.find(filter).populate('tags').sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  let newObj = req.body;
  const userId = req.user.id;
  const tags = req.body.tags;
  const folderId = req.body.folderId;
  newObj.userId = userId;

  console.log(userId);
  // console.log(tags);

  if(req.body.folderId) {
    if(!mongoose.Types.ObjectId.isValid(req.body.folderId)) {
      const err = new Error('The folder id is not valid!!');
      err.status = 400;
      next(err);
    }

    Folders.findOne({_id: folderId, userId})
      .then((folder) => {
        console.log('poop');
        if(!(folder)) {
          const err = new Error('Folder doesnt exist in user!');
          err.status = 404;
          next(err);
        }
      });
  }
  
  if(tags) {

    if(!Array.isArray(tags)) {
      const err = new Error('This is not an array!');
      err.status = 400;
      next(err);
    }

    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('Bad tag!');
        err.status = 404;
        next(err);
      }

      Tag.find({_id: {$in: req.body.tags}, userId}).count()
        .then(tagCount => {
          if( tagCount !== tags.length) {
            const err = new Error('An id in `tags` does not exist.');
            err.status = 404;
            return next(err);
          }
          else return next();
        })
        .catch(err => next(err));
        
    });
  } 

  
    
  if(!(req.body.folderId) || mongoose.Types.ObjectId.isValid(req.body.folderId)) {

    return Note.create(newObj)
      .then(results => {
        res.status(201).json(results);
    
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        next(err);
      });
  } else {
    const err = new Error('Invalid Folder ID');
    err.status = 404;
    return next(err);
  }
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const id = req.params.id;
  const newObj = req.body;
  const userId = req.user.id;
  


  const tags = req.body.tags;

  console.log(tags);

  if(tags) {
    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('Bad tag!');
        err.status = 404;
        next(err);
      }
    });
  } 

  if(!(req.body.folderId) || mongoose.Types.ObjectId.isValid(req.body.folderId)) {

    return Note.findOneAndUpdate({_id: id, userId}, newObj, {new: true})
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        next(err);
      });

  } else {
    const err = new Error('Invalid Folder ID');
    err.status = 404;
    return next(err);
  }
});


// /* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  return Note.deleteOne({id, userId}) 
    .then(res.status(204).end())
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;