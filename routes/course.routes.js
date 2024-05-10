const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = require("express").Router();
const Course = require("../models/Course.model");
const User = require("../models/User.model");

// Create a new course
router.post("/courses/create", isAuthenticated, async (req, res, next) => {
  try {
    const {
      name,
      description,
      estimatedDuration,
      level,
      programmingLanguage,
      path
    } = req.body;

    // Check if all fields have been provided
    if (
      name === "" ||
      description === "" ||
      estimatedDuration === "" ||
      level === "" ||
      programmingLanguage === "" ||
      path === ""
    ) {
      res
        .status(400)
        .json({ message: "Please make sure all fields are filled!" });
      return;
    }

    // Downcase everything from the request body before saving to database and also removing any whitespace at the ends
    const nameToSave = name.trim();
    const descriptionToSave = description.trim();
    const estimatedDurationToSave = estimatedDuration.trim();
    const programmingLanguageToSave = programmingLanguage.trim();

    const foundCourse = await Course.findOne({ name: name });
    if (foundCourse) {
      return res.status(400).json({
        message: "Course with the same name already exists"
      });
    }

    const newCourse = await Course.create({
      name: nameToSave,
      description: descriptionToSave,
      estimatedDuration: estimatedDurationToSave,
      level,
      programmingLanguage: programmingLanguageToSave,
      path,
      level,
      lessons: []
    });

    if (!newCourse) {
      return res.status(500).json({ message: "Failed to create course!" });
    }

    res
      .status(200)
      .json({ course: newCourse, message: "Course created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get all courses
router.get("/courses", async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const limitValue = parseInt(limit) || 1;
    const offsetValue = parseInt(offset) || 0;

    const courses = await Course.find();

    const totalCount = courses.length;
    const totalPages = Math.ceil(totalCount / limitValue);

    const coursesToShow = await Course.find().populate({
      path: "lessons",
      select: "-__v",
      options: { limit: limitValue, skip: offsetValue }
    });

    res.status(200).json({ courses: coursesToShow, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get a course
router.get("/courses/:courseId", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const foundCourse = await Course.findOne({ _id: courseId }).populate(
      "lessons"
    );

    // Handle course not found
    if (!foundCourse) {
      return res.status(404).json({ message: "Course not found!" });
    }

    res.status(200).json({ course: foundCourse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Edit a course
router.put(
  "/courses/:courseId/edit",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const {
        name,
        description,
        estimatedDuration,
        level,
        programmingLanguage
      } = req.body;

      // Check if all fields have been provided
      if (
        name === "" ||
        description === "" ||
        estimatedDuration === "" ||
        level === "" ||
        programmingLanguage === ""
      ) {
        res
          .status(400)
          .json({ message: "Please make sure all fields are filled!" });
        return;
      }

      // Downcase everything from thr request body before saving to database and also removing any whitespace at the ends
      const nameToSave = name.trim().toLowerCase();
      const descriptionToSave = description.trim().toLowerCase();
      const estimatedDurationToSave = estimatedDuration.trim().toLowerCase();
      const programmingLanguageToSave = programmingLanguage
        .trim()
        .toLowerCase();

      // Find course to update;

      const courseToUpdate = await Course.findOne({ _id: courseId });
      if (!courseToUpdate) {
        res.status(404).json({ message: "Course not found!" });
        return;
      }

      courseToUpdate.name = nameToSave;
      courseToUpdate.description = descriptionToSave;
      courseToUpdate.estimatedDuration = estimatedDurationToSave;
      courseToUpdate.programmingLanguage = programmingLanguageToSave;

      const updatedCourse = await courseToUpdate.save();
      if (!updatedCourse) {
        res.status(500).json({ message: "Unable to save updated course!" });
        return;
      }

      res.status(200).json({ message: "Course updated", updatedCourse });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Delete a course

router.delete("/courses/:courseId", isAuthenticated, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const foundCourse = await Course.find({ _id: courseId });

    if (!foundCourse) {
      res.status(500).json({ message: "Course not found!" });
      return;
    }

    await Course.findByIdAndDelete({ _id: courseId });

    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(505).json({ message: "Internal Server Error" });
  }
});

// router.get('/searchcourses', async (req, res, next) => {
//   try{
//     const { name } = req.query;
//     const query = { $text: { $search: name } };

//     const projection = {
//       _id: 1,
//       name: 1,
//     };

//     const cursor = await Course.find(query).select(projection);
//     if(cursor.length === 0){
//       return res.status(404).json({ message: "Not found"})
//     }

//     res.status(200).json({ courses: cursor });

//   }catch(error){
//     console.log(error);
//   }
// })

router.get("/searchcourses", async (req, res, next) => {
  try {
    const { name } = req.query;
    const regexPattern = new RegExp(name, "i");
    const query = { name: { $regex: regexPattern } };

    const projection = {
      _id: 1,
      name: 1
    };

    const cursor = await Course.find(query).select(projection);

    res.status(200).json({ courses: cursor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/user/:userId/course/:courseId/enrol", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId });
    if (!course) {
      res.status(500).json({ message: "Course not found" });
      return;
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { courses: course._id } },
      { new: true }
    );
    if (!updatedUser) {
      res.status(500).json({ message: "Unable to enrol you in the course" });
      return;
    }

    res.status(200).json({ message: "You been enroled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user/:userId/courses", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const foundUser = await User.findOne({ _id: userId }).populate("courses");

    if (!foundUser) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ courses: foundUser.courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
