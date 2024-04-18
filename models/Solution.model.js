const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const solutionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  exercise: { type: Schema.Types.ObjectId, ref: 'Exercise' },
}, {
  timestamps: true
})


module.exports = model("Solution", lessonSchema);
