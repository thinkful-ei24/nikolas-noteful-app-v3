const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe.only('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe.only('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };
        
        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            console.log(res);
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', function () {
        let res;
        return chai.request(app).post('/api/users/').send({username})
          .then((res) =>{
            expect(res).to.have.status(422);
          });
      });
      it('Should reject users with non-string username', () =>{
        return chai.request(app).post('/api/users/').send({username: 12301203, password: 'poop'})
          .then((res) => {
            console.log(res);
            expect(res).to.have.status(422);
            expect(res.body.message).to.include('Username or Password cannot only be numbers');
          });
      });      
      it('Should reject users with non-string password', () =>{
        return chai.request(app).post('/api/users/').send({username: 'hello', password: 123123123213})
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.include('Username or Password cannot only be numbers');
          });
      });
      it('Should reject users with non-trimmed username', () => {
        return chai.request(app).post('/api/users/').send({username: '    hello   ', password: 123123123213})
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.include('Username or Password cannot only be numbers');
          });
      });
    });
    it('Should reject users with non-trimmed password', () => {
      return chai.request(app).post('/api/users/').send({username: '    hello   ', password: 'dodfasidfjiofads'})
        .then((res) => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.include('Either your password or username contain spaces!');
        });
    });
    it('Should reject users with empty username', () => {
      return chai.request(app).post('/api/users/').send({username: '', password: 'poop123123'})
        .then((res) => {
          console.log(res);
          expect(res).to.have.status(404);
          expect(res.body.message).to.include('Username has to be at least 1 character!');
        });
    });
    it('Should reject users with password less than 8 characters', () => {
      return chai.request(app).post('/api/users/').send({username: 'hellomojo', password: 'poop'})
        .then((res) => {
          console.log(res);
          expect(res).to.have.status(404);
          expect(res.body.message).to.include('Password does not meet required length. (At least 8 characters and no more than 72)');
        });
    });
    it('Should reject users with password greater than 72 characters', () => {
      return chai.request(app).post('/api/users/').send({username: 'thisisanewusername', password: 'sahdfjkhdsajfhjksadhfjkhsadkjfjksadhfjkhksdhfkjhdsjkhkjsadhfkjhsakjdfhkjsadhfkjhsakjdfhkjasdhfkahskjdfhkjsadhfahkjsad'})
        .then((res) => {
          console.log(res);
          expect(res).to.have.status(404);
          expect(res.body.message).to.include('Password does not meet required length. (At least 8 characters and no more than 72)');
        });
    });
    it('Should reject users with duplicate username', () => {
      return User.create({username: 'doggydoggerson', password: 'theuejrarajfadsifj'})
        .then((obj) => {
          expect(obj.username).to.be.eql('doggydoggerson');
          return chai.request(app).post('/api/users/').send({username: 'doggydoggerson', password: 'poopopoopop'})
            .then((res) => {
              expect(res).to.have.status(400);
              expect(res.body.message).to.include('The username already exists');
            });
        });
    });
    it('Should trim fullname', () => {
      let res;
      return chai.request(app).post('/api/users/').send({username: 'jsdflajsdf', password: 'pooasdfasdp', fullname: ' Nikolas Melgarejo '})
        .then((_res) => {
          res = _res;
          console.log(res);
          expect(res).to.have.status(201);
          return User.findOne({_id: res.body.id});
        }).then((response) => {
            
          console.log(res.username);
          expect(response).to.be.a('object');
          expect(response.username).to.eql(res.body.username);
          expect(response.fullname).to.eql(res.body.fullname);
        });
    });
  });
});
