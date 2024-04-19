const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const exerciseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  programmingLanguage: {type: String, required: true},
  content: { type: String, required: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Expert"], required: true },
  lesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
  completed: { type: Boolean, default: false},
}, {
  timestamps: true
})


module.exports = model("Exercise", exerciseSchema);
