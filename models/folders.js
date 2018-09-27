const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

folderSchema.set('timestamps', true);

folderSchema.index({ name: 1, userId: 1}, { unique: true });

folderSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', folderSchema);