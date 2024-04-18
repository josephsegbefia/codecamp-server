const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
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

    // Downcase everything from thr request body before saving to database and also removing any whitespace at the ends
    const nameToSave = name.trim().toLowerCase();
    const descriptionToSave = description.trim().toLowerCase();
    const estimatedDurationToSave = estimatedDuration.trim().toLowerCase();
    // const levelToSave = level.trim().toLowerCase();
    const programmingLanguageToSave = programmingLanguage.trim().toLowerCase();

    const newCourse = await Course.create({ name:nameToSave, description:descriptionToSave, estimatedDuration:estimatedDurationToSave, level, programmingLanguage:programmingLanguageToSave, lessons:[] });

    if (!newCourse) {
      return res.status(500).json({ message: 'Failed to create course!' });
    }

    res.status(200).json({ course: newCourse, message: "Course created successfully"})

  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error});
  }
});

module.exports = router;
