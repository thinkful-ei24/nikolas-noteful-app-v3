const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const Folder = require('../models/folders');
const Note = require('../models/note');


const { folders } = require('../db/seed/folders');
const { users } = require('../db/seed/users');

chai.use(chaiHttp);
const expect = chai.expect;
const sandbox = sinon.createSandbox();




describe('Notes API Resource', function() {
       
  let token;
  let user;

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => {
        return Promise.all([
          Note.deleteMany(), 
          Folder.deleteMany(),
          User.deleteMany()
        ]);
      });
  });
              
  beforeEach(function () {
    return Promise.all([
      User.insertMany(users),
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
      Folder.deleteMany(),
      User.deleteMany()
    ]);
  });
              
  after(function() {
    return mongoose.disconnect();
  });
  

  describe('GET /api/folders', function () {
    it('should get all folders', function () {
      return Promise.all([
        Folder.find({userId: user.id}),
        chai.request(app).get('/api/folders').set('Authorization', `Bearer ${token}`)
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
      return  Folder.findOne({userId: user.id})       
        .then((folderObject) => {
          data = folderObject;
          // console.log(folderObject);
          expect(folderObject).to.be.a('object');
          console.log(folderObject.id);
          expect(folderObject.id).to.eql(data.id);
          expect(folderObject.name).to.eql(data.name);
          return chai.request(app).get(`/api/folders/${data.id}`).set('Authorization', `Bearer ${token}`);
        }).then((response) => {
          expect(response).to.be.a('object');
          console.log(response.status);
          console.log(response.body);
          expect(response.body.id).to.eql(data.id);
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
        .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
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

  //hello

  describe('DELETE /api/folders/:id', function () {
    it('should delete a folder by id', function () {
      let id;
      let object;
      return Folder.findOne({})
        .then(obj => {
          object = obj;
          id = obj.id;
          return chai.request(app)
            .delete(`/api/folders/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
              expect(res).to.have.status(204);
              expect(Folder.findById(object.id).id).to.eql(undefined);
            });
        });
    });
  });

});

