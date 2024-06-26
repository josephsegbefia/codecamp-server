const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const lessonSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  programmingLanguage: { type: String, required: true },
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
  estimatedDuration: { type: String, required: true},
  level: { type: String, enum: ["Beginner", "Intermediate", "Expert"], required: true },
  completed: { type: Boolean, default: false},
  course: { type: Schema.Types.ObjectId, ref: "Course" }
}, {
  timestamps: true
})


module.exports = model("Lesson", lessonSchema);
