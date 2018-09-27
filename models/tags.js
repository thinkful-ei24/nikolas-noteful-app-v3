const mongoose = require('mongoose');


const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Add `createdAt` and `updatedAt` fields
tagSchema.set('timestamps', true);

tagSchema.index({ name: 1, userId: 1}, { unique: true });
//sets it so our database isnt restricted to a tag with a name for ALL users.. this makes it apply to each user

tagSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Tag', tagSchema);