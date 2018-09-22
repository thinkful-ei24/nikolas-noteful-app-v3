'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  let {searchTerm, folderId, tagId} = req.query;
  

  console.log(req.params);
  
  let filter = {};

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
  
  console.log(filter);

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


  const {id} = req.params;

  return Note.findById(id
  ).populate('tags')

    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  let newObj = req.body;

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

    return Note.findByIdAndUpdate(id, newObj, {new: true})
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
     
  return Note.findByIdAndRemove(id) 
    .then(res.status(204).end())
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;