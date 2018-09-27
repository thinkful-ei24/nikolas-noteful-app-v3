const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const Tag = require('../models/tags');

const Folder = require('../models/folders');
const Note = require('../models/note');

const { tags } = require('../db/seed/tags');
const { folders } = require('../db/seed/folders');
const { users } = require('../db/seed/users');
const { notes } = require('../db/seed/notes');
chai.use(chaiHttp);
const expect = chai.expect;
const sandbox = sinon.createSandbox();


describe('hooks', function() {
  let token;
  let user;

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => {
        return Promise.all([
          Note.deleteMany(), 
          Tag.deleteMany(),
          Folder.deleteMany(),
          User.deleteMany()
        ]);
      });
  });
              
  beforeEach(function () {
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Tag.insertMany(tags),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });
              
  afterEach(function () {
    sandbox.restore();
    return Promise.all([
      Note.deleteMany(), 
      Tag.deleteMany(),
      Folder.deleteMany(),
      User.deleteMany()
    ]);
  });
  // test cases
  

  describe('api requests to root /api/notes', function () {

    describe('GET REQUEST TO /api/notes/', function() {
      it('Should return all notes to the api', function() {
        let res;
        return chai.request(app)
          .get('/api/notes/')
          .set('Authorization', `Bearer ${token}`)
          .then(_res => {
            res = _res;
            expect(res.body).to.be.a('array');
            expect(res).to.have.status(200);
            return Note.find({"userId": user.id});
          }).then(document => {
            expect(document.length).to.eql(res.body.length);
          });
      });
    });
  

    describe('GET /api/notes/:id', function () {
      it('should return correct note', function () {
        let data;
        // 1) First, call the database
        return Note.findOne({'userId': user.id})
          .then(_data => {
            console.log(data);
            data = _data;
            // 2) then call the API with the ID
            return chai.request(app).get(`/api/notes/${data.id}`).set('Authorization', `Bearer ${token}`);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            expect(res.body).to.be.an('object');
            console.log(res.body);
            expect(res.body).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'tags','userId');

            // 3) then compare database results to API response
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          });
      });
    });


    describe('POST REQUEST TO /api/notes', function() {
      it('Should return the new object to the api', function () {
        let newObj = {
          'title': 'this is a test1',
          'content': 'this is a content1',
          'folderId': '222222222222222222222201'
        };
        return chai.request(app)
          .post('/api/notes/')
          .set('Authorization', `Bearer ${token}`)
          .send(newObj)
          .then((res) => {
            expect(res).to.have.status(201);
            return Note.findOne({"userId": user.id, "title": newObj.title});
          }).then((note)=> {
            expect(note.title).to.be.eql(newObj.title);
            expect(note.content).to.be.eql(newObj.content);
          });

      });
    });


    describe('PUT REQUEST TO /api/notes/:id', function() {
      it('Should change an existing object to one with new stuff', function() {
      
        const newObj = {
          'title': 'test4',
          'content': 'test6',
          'folderId': '222222222222222222222201'
        };

        let data1;
        return Note.findOne({"userId": user.id})
          .then(data => {
            data1 = data;
            return chai.request(app)
              .put(`/api/notes/${data.id}`)
              .set('Authorization', `Bearer ${token}`)
              .send(newObj);
          })
          .then((res)=> {
            expect(res).to.have.status(201);
            return Note.findById(data1.id);
          })
          .then((res) => {
            
            expect(res.title).to.equal(newObj.title);
            expect(res.content).to.equal(newObj.content);
          });
      });
    });

    // describe('DELETE REQUEST TO /api/notes/:id', function() {
    //   it('Should delete an existing object from the database per request', function() {
    //     let oldNote;
    //     return Note.findOne()
    //       .then(note => {
    //         oldNote = note;
    //         return chai.request(app)
    //           .delete(`/api/notes/${oldNote.id}`);
    //       })
    //       .then(res => {
    //         expect(res).to.have.status(204);
    //         // expect(Note.findById(oldNote.id)).to.eql(undefined);
    //       });
    //   });
    // });

    describe('DELETE endpoints', function() {
      it('should delete a note by id', function() {
      //create empty variable note to store our result in this scope
        let note;

        //find a note and pass it into response
        return (
          Note.findOne({"userId": user.id})
            .then(foundNote => {
            //set note variable to note object in response
              note = foundNote;
              return chai.request(app).delete(`/api/notes/${note.id}`).set('Authorization', `Bearer ${token}`);
            })
            .then(response => {
              expect(response).to.have.status(204);
              console.log(response.status);
              return Note.findOne({"_id": note.id, "userId": user.id});
            })
          //look in DB and make sure the passed in note is gone.
            .then(response => {
              console.log(response);
            
            })
        );
      });
    });
  
  });
});

