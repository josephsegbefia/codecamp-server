const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const Lesson = require('../models/Lesson.model');
const Course = require('../models/Course.model');

// Create a new lesson;
router.post('/courses/:courseId/lessons/create', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { name, description, content, estimatedDuration, level, programmingLanguage } = req.body;

    if (name === "" || description === "" || content === "" || estimatedDuration === "" || level === "" || programmingLanguage === "") {
      res.status(400).json({ message: "Please make sure all fields are filled!" });
      return;
    }

    const course = await Course.findOne({ _id: courseId });
    if(!course){
      res.status(404).json({message: "Course not found"})
    }

    const createdLesson = await Lesson.create({name, description, content, estimatedDuration, level, programmingLanguage, exercises:[], course: course._id});

    if(!createdLesson){
      return res.status(500).json({ message: 'Failed to create lesson!' });
    }

    const updatedCourse = await Course.findOneAndUpdate({_id: courseId}, {$push: {lessons: createdLesson._id}}, {new: true});
    if(!updatedCourse){
      return res.status(500).json({message: "Could not add lesson to course"})
    }

    res.status(200).json({message: "Lesson created and added to course", createdLesson});



  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})


module.exports = router;
