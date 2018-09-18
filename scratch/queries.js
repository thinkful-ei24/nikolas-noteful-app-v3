const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// FIND / SEARCH for notes using Note.find
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchTerm = 'Alecs Revenge Part 2';
//     let filter = {};

//     console.log(`/${searchTerm}/i`);

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i' };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// FIND / SEARCH by id 
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000001';
//     let filter = {};

    

//     if (id) {
//       filter.id = { _id: id };
//     }

//     return Note.findById(filter.id, function(err, user){
//       if(err) {
//         console.log('no id found!');
//       }
//       else {
//         return user;
//       }
//     });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//CREATE INTO NOTES

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {

//     let newObj = {
//       title: 'poop',
//       content: 'poppopopop'
//     };
//     return Note.create(newObj); 
//   })
//   .then(results => {
//     console.log(results);
    
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// NOTE.findByIdAndUpdate
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000001';

//     let newObj = {
//       title: 'Alecs Revenge Part 2',
//       content: 'asdf'
//     };
//     return Note.findByIdAndUpdate(id, newObj); 
//   })
//   .then(results => {
//     console.log(results);
    
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//NOTE FIND BY ID AND DELETE
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const id = '000000000000000000000001';

    
//     return Note.findByIdAndRemove(id); 
//   })
//   .then(results => {
//     console.log(results);
    
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

