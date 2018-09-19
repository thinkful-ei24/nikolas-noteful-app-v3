const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

const newLocal = 'DELETE REQUEST TO /api/notes/:id';
describe.only('hooks', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function() {
    return Note.insertMany(notes);
  });
    
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
    
  });
    
  after(function() {
    return mongoose.disconnect();
  });
  
  

  // test cases
  
  describe('Notes API Resource', function() {
    describe('GET REQUEST TO /api/notes/', function() {
      it('Should return all notes to the api', function() {
        let res;
        return chai.request(app)
          .get('/api/notes')
          .then(_res => {
            res = _res;
            expect(res.body).to.be.a('array');
            expect(res).to.have.status(200);
            return Note.find();
          }).then(document => {
            expect(document.length).to.eql(res.body.length);
          });
      });
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should return correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

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
        'content': 'this is a content1'
      };
      return chai.request(app)
        .post('/api/notes')
        .send(newObj)
        .then((res) => {
          expect(res).to.have.status(201);
          return Note.findById(res.body.id);
        }).then((note)=> {
          expect(note.title).to.be.eql(newObj.title);
          expect(note.content).to.be.eql(newObj.content);
        });

    });
  });


  describe('PUT REQUEST TO /api/notes/:id', function() {
    it('Should change an existing object to one with new shit', function() {
      
      const newObj = {
        'title': 'test4',
        'content': 'test6'
      };
      return Note.findOne()
        .then(data => {
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(newObj)
            .then((res)=> {
              expect(res).to.have.status(200);
              return Note.findById(data.id);
            })
            .then((res) => {
              console.log(res);
              expect(res.title).to.equal(newObj.title);
              expect(res.content).to.equal(newObj.content);
            });
        });
    });
  });

  describe('DELETE REQUEST TO /api/notes/:id', function() {
    it('Should delete an existing object from the database per request', function() {
      let oldNote;
      return Note.findOne()
        .then(note => {
          oldNote = note;
          return chai.request(app)
            .delete(`/api/notes/${oldNote.id}`)
            .then(res => {
              expect(res).to.have.status(204);
              expect(Note.findById(oldNote.id).id).to.eql(undefined);
            });
        });
    });
  });
});