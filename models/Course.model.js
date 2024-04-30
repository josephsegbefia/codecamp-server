const mongoose = require("mongoose");
const { Schema, model } = mongoose;
// const { isURL, isEmail } = require("validator");


const courseSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  programmingLanguage: {type: String, required: true},
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  estimatedDuration: { type: String, required: true},
  completed: { type: Boolean, default: false },
  published: {type: Boolean, default: false},
  level: { type: String, enum: ["Beginner", "Intermediate", "Expert"], required: true },
  lastAccessedDate: { type: String }
}, {
  timestamps: true
})


module.exports = model("Course", courseSchema);
