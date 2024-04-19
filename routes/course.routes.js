const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const router = require('express').Router();
const Course = require('../models/Course.model');

// Create a new course
router.post('/courses/create', async (req, res, next) => {
  try {
    const { name, description, estimatedDuration, level, programmingLanguage } = req.body;

    // Check if all fields have been provided
    if (name === "" || description === "" || estimatedDuration === "" || level === "" || programmingLanguage === "") {
      res.status(400).json({ message: "Please make sure all fields are filled!" });
      return;
    }

    // Downcase everything from the request body before saving to database and also removing any whitespace at the ends
    const nameToSave = name.trim().toLowerCase();
    const descriptionToSave = description.trim().toLowerCase();
    const estimatedDurationToSave = estimatedDuration.trim().toLowerCase();
    const programmingLanguageToSave = programmingLanguage.trim().toLowerCase();

    const newCourse = await Course.create({ name:nameToSave, description:descriptionToSave, estimatedDuration:estimatedDurationToSave, level, programmingLanguage:programmingLanguageToSave, lessons:[] });

    if (!newCourse) {
      return res.status(500).json({ message: 'Failed to create course!' });
    }

    res.status(200).json({ course: newCourse, message: "Course created successfully"})

  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get all courses
router.get('/courses', async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const limitValue = parseInt(limit) || 1;
    const offsetValue = parseInt(offset) || 0;


    const courses = await Course.find()

    const totalCount = courses.length;
    const totalPages = Math.ceil(totalCount / limitValue);

    const coursesToShow = await Course.find().populate({path: 'lessons', select: '-__v', options: {limit: limitValue, skip: offsetValue }})

    res.status(200).json({ courses: coursesToShow, totalPages });

  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error"});
  }
});

// get a course
router.get('/courses/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const foundCourse = await Course.findOne({ _id: courseId }).populate('lessons');

    // Handle course not found
    if(!foundCourse){
      return res.status(404).json({message: "Course not found!"});
    }

    res.status(200).json({course: foundCourse})
  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Edit a course
router.put('/courses/:courseId/edit', async (req, res, next) => {
  try{
    const { courseId } = req.params;
    const { name, description, estimatedDuration, level, programmingLanguage } = req.body;

    // Check if all fields have been provided
    if (name === "" || description === "" || estimatedDuration === "" || level === "" || programmingLanguage === "") {
      res.status(400).json({ message: "Please make sure all fields are filled!" });
      return;
    }

    // Downcase everything from thr request body before saving to database and also removing any whitespace at the ends
    const nameToSave = name.trim().toLowerCase();
    const descriptionToSave = description.trim().toLowerCase();
    const estimatedDurationToSave = estimatedDuration.trim().toLowerCase();
    const programmingLanguageToSave = programmingLanguage.trim().toLowerCase();

    // Find course to update;

    const courseToUpdate = await Course.findOne({_id: courseId });
    if(!courseToUpdate){
      res.status(404).json({ message: "Course not found!"});
      return;
    }

    courseToUpdate.name = nameToSave;
    courseToUpdate.description = descriptionToSave;
    courseToUpdate.estimatedDuration = estimatedDurationToSave;
    courseToUpdate.programmingLanguage = programmingLanguageToSave;

    const updatedCourse = await courseToUpdate.save();
    if(!updatedCourse){
      res.status(500).json({ message: "Unable to save updated course!"});
      return;
    }

    res.status(200).json({message: "Course updated", updatedCourse});
  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a course

router.delete('/courses/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const foundCourse = await Course.find({ _id: courseId });

    if(!foundCourse){
      res.status(500).json({ message: "Course not found!"});
      return;
    }

    await Course.findByIdAndDelete({ _id: courseId });

    res.status(200).json({ message: "Course deleted successfully!"});
  }catch(error){
    console.log(error);
    res.status(505).json({ message: "Internal Server Error" });
  }
})
module.exports = router;
