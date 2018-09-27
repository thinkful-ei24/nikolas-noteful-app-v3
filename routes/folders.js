const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folders = require('../models/folders');

const passport = require('passport');
router.use(passport.authenticate('jwt', { session: false, failWithError: true })); //Use the jwt auth on each call within router
// GET all /folders
// Sort by name

router.get('/',  (req, res, next) => {
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
  const { id, } = req.params;
  const userId = req.user.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Folders.findOne({_id: id, userId})
      .then(folder => {
        res.status(200).json(folder);
      }).catch(err => {
        next(err);
      });
  }
  else {
    res.status(404).json('This ID is not a Mongo ObjectId (length !== 12)');
  }
});


// POST /folders to create a new folder
// Validate the incoming body has a name field
// Respond with a 201 status and location header
// Catch duplicate key error code 11000 and respond with a helpful error message (see below for sample code)

router.post('/', (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;
  
  const newObj = req.body;
  newObj.userId = userId;
  if(!(name)) {
    res.status(404).json('There is no name in the request body!');
  }

  

  if(name) {
    return Folders.create(newObj)
      .then(newFolder => {
        res.location(`${res.originalUrl}/${newFolder.id}`).status(201).json(newFolder);
      }).catch(err => {
        if (err.code === 11000) {
          err = new Error('The folder name already exists');
          err.status = 400;
        }
        next(err);
      });
  }

});

// PUT /folders by id to update a folder name
// Validate the incoming body has a name field
// Validate the id is a Mongo ObjectId
// Catch duplicate key error code 11000 and respond with a helpful error message

router.put('/:id', (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const newUpdateValues = {name, id};
  let userId = req.user.id;
  if(!(name)) {
    res.status(404).json('There is no name in the request body!');
  }

  if(name && mongoose.Types.ObjectId.isValid(id)) {
      
    return Folders.findOneAndUpdate({_id: id, userId}, newUpdateValues, {new: true})
      .then(obj => {
        res.location(`${res.originalUrl}/${obj.id}`).status(201).json(obj);
      }).catch(err => {
        if (err.code === 11000) {
          err = new Error('The Object key name already exists');
          err.status = 400;
        }
        next(err);
      });
  }
});

// DELETE /folders by id which deletes the folder AND the related notes
// Respond with a 204 status

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  if(mongoose.Types.ObjectId.isValid(id)) {
    return Folders.findOneAndRemove({_id: id, userId})
      .then(response => {
        res.status(204).json(response);
      });
  } else {
    res.status(400).json('This ID is not a Mongo ObjectId (length !== 12)');
  }
});

module.exports = router;