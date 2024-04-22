const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const router = require('express').Router();
const Course = require('../models/Course.model');
const User = require('../models/User.model');

// Add course to a user

router.post('/user/:userId/course/:courseId/enrol', async (req, res, next) => {
  try {

    const { userId } = req.params;
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId });
    if(!course){
      res.status(500).json({ message: "Course not found" });
      return;
    }
    const updatedUser = await User.findOneAndUpdate({_id: userId }, {$push: {courses: course._id}}, {new: true});
    if(!updatedUser){
      res.status(500).json({ message: "Unable to enrol you in the course" });
      return;
    }

    res.status(200).json({ message: "You been enroled" });
  }catch(error){
    res.status(500).json({ message: "Internal Server Error" });
  }
})

// Get Course Information for dashboard
router.get('/user/:userId/dashboard', async (req, res, next) => {
  try {
    const { page } = req.query;

    const { userId } = req.params;

    if (page === 'dashboard' || page === '') {
      const foundUser = await User.findOne({ _id: userId }).populate('courses')
      if (foundUser) {
        return res.status(200).json({ courses: foundUser.courses[0] });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    if (page === 'learning'){
      const foundUser = await User.findOne({ _id: userId }).populate('courses')
      if(foundUser){
        return res.status(200).json({ courses: foundUser.courses})
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
