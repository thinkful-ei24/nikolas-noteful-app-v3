const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folders');

const { folders } = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);




describe('Notes API Resource', function() {
       


  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
              
  beforeEach(function() {
    return Folder.insertMany(folders)
      .then(() => {
        Folder.createIndexes();
      });
  });
              
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
              
  });
              
  after(function() {
    return mongoose.disconnect();
  });
  

  describe('GET /api/folders', function () {
    it('should get all folders', function () {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ]).then(([data, res]) => {
        expect(data[0]).to.be.a('object');
        expect(res).to.be.json;
        expect(res.body).to.have.length(data.length);
      });
    });
  });

  describe('GET /api/folders/:id', function () {
    it('should get a folder by id', function () {
      let data;
      return Promise.all([
        Folder.findOne()
          .then(folderObj => {
            data = folderObj;
            return chai.request(app).get(`/api/folders/${folderObj.id}`);
          })
      ]).then(([folderObject]) => {
        console.log(folderObject);
        expect(folderObject.body).to.be.a('object');
        expect(folderObject).to.have.status(200);
        expect(folderObject).to.be.json;
        console.log(folderObject.body.id);
        expect(folderObject.body.id).to.eql(data.id);
        expect(folderObject.body.name).to.eql(data.name);
      });
    });
  });

  describe('POST /api/folders', function () {
    it('should post a new folder.', function () {
      const newObj = {
        'name': 'kentisawesome'
      };
      return chai.request(app)
        .post('/api/folders')
        .send(newObj)
        .then((res) => {
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          return Folder.findById(res.body.id);
        }).then((folder)=> {
          expect(folder.name).to.be.eql(newObj.name);
        });
    });
  });

  describe('PUT /api/folders/:id', function () {
    it('should update a folder by id', function () {
      const updateObj = {
        'name': 'hello'
      };
      let id;
      return Folder.findOne()
        .then(obj => {
          id = obj.id;
          return chai.request(app)
            .put(`/api/folders/${id}`)
            .send(updateObj)
            .then(res => {
              expect(res).to.have.status(201);
              expect(res).to.have.header('location');
              expect(res).to.be.json;
              expect(res.body).to.be.an('object');
              return Folder.findById(res.body.id)
                .then((endFolder) => {
                  expect(endFolder.name).to.be.eql(updateObj.name);
                  expect(endFolder.id).to.be.eql(id);
                });
            });
        });
    });
  });

  describe('DELETE /api/folders/:id', function () {
    it('should delete a folder by id', function () {
      let id;
      let object;
      return Folder.findOne()
        .then(obj => {
          object = obj;
          id = obj.id;
          return chai.request(app)
            .delete(`/api/folders/${id}`)
            .then((res) => {
              expect(res).to.have.status(204);
              expect(Folder.findById(object.id).id).to.eql(undefined);
            });
        });
    });
  });

});

