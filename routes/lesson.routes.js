const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = require("express").Router();
const Lesson = require("../models/Lesson.model");
const Course = require("../models/Course.model");
const User = require("../models/User.model");

// Create a new lesson;
router.post(
  "/courses/:courseId/lessons/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const {
        name,
        description,
        content,
        estimatedDuration,
        level,
        programmingLanguage
      } = req.body;

      if (
        name === "" ||
        description === "" ||
        content === "" ||
        estimatedDuration === "" ||
        level === "" ||
        programmingLanguage === ""
      ) {
        res
          .status(400)
          .json({ message: "Please make sure all fields are filled!" });
        return;
      }

      const course = await Course.findOne({ _id: courseId });
      if (!course) {
        res.status(404).json({ message: "Course not found" });
      }

      const createdLesson = await Lesson.create({
        name,
        description,
        content,
        estimatedDuration,
        level,
        programmingLanguage,
        exercises: [],
        course: course._id
      });

      if (!createdLesson) {
        return res.status(500).json({ message: "Failed to create lesson!" });
      }

      const updatedCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { lessons: createdLesson._id } },
        { new: true }
      );
      if (!updatedCourse) {
        return res
          .status(500)
          .json({ message: "Could not add lesson to course" });
      }

      res
        .status(200)
        .json({ message: "Lesson created and added to course", createdLesson });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// get All lessons for a course for an ongoing lesson;
router.get(
  "/learn/user/:userId/courses/:courseId/lessons",
  async (req, res, next) => {
    try {
      const { userId, courseId } = req.params;
      const { limit, offset } = req.query;
      const limitValue = parseInt(limit) || 1;
      const offsetValue = parseInt(offset) || 0;

      const user = await User.findById(userId).populate("courses");

      const courseLessons = await user.courses
        .find((course) => course._id.toString() === courseId)
        .populate({
          path: "lessons",
          select: "-__v",
          options: { limit: limitValue, offset: offsetValue }
        });
      res.status(200).json({ lessons: courseLessons });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
    // const { userId, courseId } = req.params;
    // const { limit, offset } = req.query;
    // const limitValue = parseInt(limit) || 1;
    // const offsetValue = parseInt(offset) || 0;
    // Course.findOne({ _id: courseId })
    //   .populate("lessons", "-__v")
    //   .select("lessons")
    //   .then((course) => {
    //     console.log(course);
    //     if (!course) {
    //       return res.status(404).json({ message: "Course not found" });
    //     }
    //     const totalCount = course.lessons.length;
    //     const totalPages = Math.ceil(totalCount / limitValue);
    //     Course.findOne({ _id: courseId })
    //       .populate({
    //         path: "lessons",
    //         select: "-__v",
    //         options: {
    //           limit: limitValue,
    //           skip: offsetValue
    //         }
    //       })
    //       .select("lessons")
    //       .then((paginatedCourse) => {
    //         res
    //           .status(200)
    //           .json({ lessons: paginatedCourse.lessons, totalPages });
    //       })
    //       .catch((error) =>
    //         res.status(500).json({ message: "Ooops, something went wrong!" })
    //       );
    //   })
    //   .catch((error) =>
    //     res.status(500).json({ message: "Ooops, something went wrong!" })
    //   );
  }
);

// edit a lesson
router.put(
  "/courses/:courseId/lessons/:lessonId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { courseId, lessonId } = req.params;
      const {
        name,
        description,
        content,
        estimatedDuration,
        level,
        programmingLanguage
      } = req.body;

      const course = await Course.findOne({ _id: courseId }).populate(
        "lessons"
      );

      if (!course) {
        res.status(500).json({ message: "Course not found!" });
        return;
      }

      const lessonToUpdate = course.lessons.find(
        (lesson) => lesson._id.toString() === lessonId
      );

      if (!lessonToUpdate) {
        res.status(500).json({ message: "Lesson not found!" });
        return;
      }

      lessonToUpdate.name = name;
      lessonToUpdate.description = description;
      lessonToUpdate.content = content;
      lessonToUpdate.estimatedDuration = estimatedDuration;
      lessonToUpdate.level = level;
      lessonToUpdate.programmingLanguage = programmingLanguage;

      const updatedLesson = await lessonToUpdate.save();

      res.status(200).json({
        message: "Lesson updated successfully",
        updatedLesson: updatedLesson
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// delete a lesson
router.delete(
  "/courses/:courseId/lessons/:lessonId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { courseId, lessonId } = req.params;

      const course = await Course.findOne({ _id: courseId }).populate(
        "lessons"
      );

      if (!course) {
        res.status(500).json({ message: "Course not found!" });
        return;
      }

      // Find lesson index within the course lessons array
      const lessonIndex = course.lessons.findIndex(
        (lesson) => lesson._id.toString() === lessonId
      );

      if (lessonIndex === -1) {
        res.status(500).json({ message: "Lesson not found in course" });
        return;
      }

      // Remove lesson from course & save course
      course.lessons.splice(lessonIndex, 1);
      await course.save();

      // delete lesson
      await Lesson.findByIdAndDelete(lessonId);

      res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
