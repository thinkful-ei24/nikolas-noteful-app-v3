const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tag = require('../models/tags');


// GET all /tags
// Sort the response by name
router.get('/', (req, res, next) => {
  console.log('hi');
  return Tag.find().sort('-name')
    .then(response => {
      return res.json(response);
    }).catch((err) => {
      next(err);
    });
});

// GET /tags by id
// Add validation that protects against invalid Mongo ObjectIds and prevents unnecessary database queries.
// Add condition that checks the result and returns a 200 response with the result or a 404 Not Found

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(mongoose.Types.ObjectId.isValid(id)) {
    return Tag.findById({_id: id})
      .then(response => {
        return res.status(200).json(response);
      }).catch((err) => {
        next(err);
      });
  }
});


// POST /tags to create a new tag
// Add validation that protects against missing name field
// A successful insert returns a location header and a 201 status
// Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.post('/', (req, res, next) => {

  if(!(req.body.name)) {
    res.status(404).json('There is no name in the field');
  }
  return Tag.create(req.body)
    .then(response => {
      return res.location(`${response.originalUrl}/${response.id}`).status(201).json(response);
    }).catch((err) => {
      next(err);
    });
});

// PUT /tags by id to update a tag
// Add validation which protects against missing name field
// Add validation which protects against an invalid ObjectId
// Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
// Ensure you are returning the updated/modified document, not the document prior to the update
// Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.put('/:id', (req, res, next) => {

  if(!(req.body.name)) {
    const err = new Error('Name is invalid');
    err.status = 404;
    next(err);
  }

  if(!(mongoose.Types.ObjectId.isValid(req.params.id))) {
    const err = new Error('Id is invalid');
    err.status = 404;
    next(err);
  }
    
  return Tag.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true})
    .then(response => {
      res.status(201).json(response);
    }).catch(err => {
      next(err);
    });
    
});

// DELETE /tags by id deletes the tag AND removes it from the notes collection
// Remove the tag
// Using $pull, remove the tag from the tags array in the notes collection.
// Add condition that checks the result and returns a 200 response with the result or a 204 status

router.delete('/:id', (req, res, next) => {
  if(!(mongoose.Types.ObjectId.isValid(req.params.id))) {
    const err = new Error('Id is invalid');
    err.status = 404;
    next(err);
  }
  
  return Tag.findByIdAndRemove({_id: req.params.id})
    .then(response => {
      res.status(204).json(response);
    }).catch(err => {
      next(err);
    });

});

module.exports = router;