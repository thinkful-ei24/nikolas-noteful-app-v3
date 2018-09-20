const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folders = require('../models/folders');

// GET all /folders
// Sort by name

router.get('/', (req, res, next) => {
  return Folders.find().sort({'name': 1})
    .then((folders) => {
      res.status(200).json(folders);
    }).catch(err => {
      next(err);
    });
});

// GET /folders by id
// Validate the id is a Mongo ObjectId
// Conditionally return a 200 response or a 404 Not Found

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Folders.findOne({_id: `${id}`})
      .then(folder => {
        res.status(200).json(folder);
      }).catch(err => {
        next(err);
      });
  }
  else {
    res.status(400).json('This ID is not a Mongo ObjectId (length !== 12)');
  }
});


// POST /folders to create a new folder
// Validate the incoming body has a name field
// Respond with a 201 status and location header
// Catch duplicate key error code 11000 and respond with a helpful error message (see below for sample code)

// router.post('/', (req, res, next) => {
//     const 
// });

// PUT /folders by id to update a folder name
// Validate the incoming body has a name field
// Validate the id is a Mongo ObjectId
// Catch duplicate key error code 11000 and respond with a helpful error message


// DELETE /folders by id which deletes the folder AND the related notes
// Respond with a 204 status

module.exports = router;