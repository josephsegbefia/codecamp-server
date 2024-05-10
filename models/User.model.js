const { Schema, model } = require("mongoose");
const { isEmail, isURL } = require("validator");

function emailSchema(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    required: !!required,
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email address`
    }
  };
}

function urlSchema(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    required: !!required,
    validate: {
      validator: isURL,
      message: (props) => `${props.value} is not a valid URL`
    }
  };
}

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: emailSchema(),
  password: { type: String, required: true },
  emailToken: { type: String },
  passwordResetToken: { type: String },
  // Remeber to change isVerified to false
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  progress: []
  // coursesProgress: [
  //   {
  //     course: { type: Schema.Types.ObjectId, ref: "Course" },
  //     lessonsProgress: [
  //       {
  //         lesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
  //         exercisesProgress: [
  //           {
  //             exercise: { type: Schema.Types.ObjectId, ref: "Exercise" },
  //             completed: { type: Boolean, default: false }
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // ]
});

const User = model("User", userSchema);

module.exports = User;
