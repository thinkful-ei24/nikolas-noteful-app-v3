'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  let {searchTerm} = req.query;

  console.log(req.params);
  
  if (searchTerm) {

    return Note.find({$or: [
      {title:  { $regex: searchTerm, $options: 'i' }},
      {content: { $regex: searchTerm, $options: 'gi'}},
    ]}).sort({ updatedAt: 'desc' })
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }
  
  if(!(searchTerm)) {
    return Note.find()
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  }

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
      console.error(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  let newObj = req.body;

  return Note.create(newObj)

    .then(results => {
      
      res.status(201).json(results);
    
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const id = req.params.id;
  const newObj = req.body;

  return Note.findByIdAndUpdate(id, newObj, {new: true})

    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

});

// /* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
    .then(() => {
     
      return Note.findByIdAndRemove(id); 
    })
    .then(results => {
      res.status(204).json(results);
    
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;