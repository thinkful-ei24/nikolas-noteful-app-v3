const express = require('express');
const router = express.Router();
const passport = require('passport');
const JWT = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY  }=   require('../config');

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

function createAuthToken (user) {
  return JWT.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});


router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;