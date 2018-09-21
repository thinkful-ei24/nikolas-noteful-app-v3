'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  let {searchTerm, folderId} = req.query;
  

  console.log(req.params);
  
  let filter = {};

  const re = new RegExp(searchTerm, 'gi');

  if (searchTerm) {
    filter = { $or: [{title: {$regex: re}}, {content: { $regex: re}}]};
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  return Note.find(filter).sort({ updatedAt: 'desc' })
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
  )

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