const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Tag = require('../models/tags');
const Folder = require('../models/folders');
const User = require('../models/user');

const { notes } = require('../db/seed/notes');
const { folders } = require('../db/seed/folders');
const { tags } = require('../db/seed/tags');
const { users } = require('../db/seed/users');

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });

