const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = Schema({
  fullname: {type: String},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.set('toObject', {
  virtuals: true, //returns regular id in this scenario
  versionKey: false,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});





module.exports = mongoose.model('User', userSchema);