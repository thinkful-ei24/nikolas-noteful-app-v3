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

chai.use(chaiHttp);
const expect = chai.expect;
const sandbox = sinon.createSandbox();


describe('tags routers', function () {
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
              
  after(function() {
    return mongoose.disconnect();
  });

  describe('GET all request to root /api/tags', function () {
    it('should return all the tags', function () {
      return Promise.all([
        Tag.find({userId: user.id}),
        chai.request(app).get('/api/tags').set('Authorization', `Bearer ${token}`)
      ]).then(([dbData, apiData]) => {
        console.log(dbData);
        console.log(apiData.body);
        expect(apiData.body).to.have.length(dbData.length);
      });
    });
    //EXAMPLE OF: Serial Request - Call API then call DB then compare
    it('should return tags with right fields', function() {
      //setting up empty variable resFolder to hold results in this scope
      let resTag;
      //1. First, call the API
      return (
        chai
          .request(app)
          .get('/api/tags')
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            console.log(res.body);
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.a.lengthOf.at.least(1);

            res.body.forEach(tag => {
              expect(tag).to.be.a('object');
              expect(tag).to.include.keys('name');
            });

            resTag = res.body[0];
            //2. then call the database to retrieve the new document
            return Tag.find({'userId': user.id});
          })
        //3. then compare the API response to the database results
          .then(tag => {
            expect(resTag.id).to.equal(tag[0].id);
            expect(resTag.name).to.equal(tag[0].name);
            expect(new Date(resTag.createdAt)).to.eql(tag[0].createdAt);
            expect(new Date(resTag.updatedAt)).to.eql(tag[0].createdAt);
          })
      );
    }); 
  });

  describe('GET by id @ /api/tags/:id should return the proper tag', function () {
    let tag;
    it('should return the tag that matches the id', function() {
      return Tag.findOne()
        .then(_tag => {
          tag = _tag;
          console.log(tag);
          expect(tag).to.be.a('object');
          //expect(tag).to.include.keys('name');
          //expect(tag).to.have.a.lengthOf(1);
          return chai.request(app).get(`/api/tags/${tag.id}`).set('Authorization', `BEARER ${token}`)
        }).then((res) => {
          expect(res.body.id).to.eql(tag.id);
          expect(res.body).to.include.keys('name');
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
        });
    });
  });

  describe('POST by id @ /api/tags should successfully post to the api', function () {
    it('should post a new object', function () {
      let newTag = {
        name: 'bob'
      };
      let data;
      return chai.request(app).post('/api/tags').send(newTag).set('Authorization', `BEARER ${token}`)
        .then(res => {
          data = res;
          expect(res).to.have.status(201);
          expect(res).to.be.a('object');
          expect(res.body).to.include.keys(['name', 'createdAt', 'updatedAt']);
          return Tag.findById(res.body.id);
        }).then((tagObj) => {
          expect(data.body.name).to.be.equal(tagObj.name);
          expect(data.body.id).to.be.equal(tagObj.id);
          expect(new Date(data.body.createdAt)).to.be.eql(tagObj.createdAt);
        });
    });
  });

  describe('PUT by id @ /api/tags/:id should successfully update to the api', function () {
    it('should update a new obj that was existing', function () {
      const newTagObj = {
        name: 'pooprift'
      };
      let data;
      //1. First, call the database
      return Tag.findOne({'userId': user.id})
        .then(tag => {
          newTagObj.id = tag.id;
          return chai.request(app).put(`/api/tags/${tag.id}`).set('Authorization', `BEARER ${token}`).send(newTagObj, {new: true})
        }).then(response => {
          expect(response).to.have.status(201);
          return Tag.findOne({'userId': user.id, 'name': 'pooprift'});
        }).then(endObjTag => {
          expect(endObjTag.name).to.be.eql(newTagObj.name);
          expect(endObjTag.id).to.be.eql(newTagObj.id);
        });
      //2. Then call the API with the ID
      //3. Then compare database results to API response
    });

    
    describe('Delete by id @ /api/tags/:id should successfully delete from the api', function () {
      it('should delete an object', function() {
        let oldTag;
        return Tag.findOne()
          .then(tag => {
            oldTag = tag;
            return chai.request(app).delete(`/api/tags/${tag.id}`).set('Authorization', `BEARER ${token}`);
          }).then(res => {
            expect(res).to.have.status(204);
            return Tag.findById(oldTag.id);
          });
      }); 
    });
  });
});



//  return Tag.findOne()
//  .then(result => {
//    data = result;
//   
//    return chai.request(app).get(`/api/tags/${data.id}`);
//  })
//  .then(res => {
//    expect(res).to.have.status(200);
//    expect(res).to.be.json;

//    expect(res.body).to.be.an('object');
//    expect(res.body).to.have.keys(
//      'id',
//      'name',
//      'createdAt',
//      'updatedAt'
//    );
//    
//    expect(res.body.id).to.equal(data.id);
//    expect(res.body.name).to.equal(data.name);
//    expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
//    expect(new Date(res.body.upda