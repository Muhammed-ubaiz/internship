import mongoose from 'mongoose';
import Course from './Model/Coursemodel.js';
import Student from './Model/Studentsmodel.js';
import Batch from './Model/Batchmodel.js';
import dotenv from 'dotenv';

dotenv.config();

const addSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
    console.log('Connected to MongoDB');

    // Add sample courses
    const courses = [
      { name: 'Computer Science', duration: '4 years' },
      { name: 'Information Technology', duration: '4 years' },
      { name: 'Mechanical Engineering', duration: '4 years' }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      let course = await Course.findOne({ name: courseData.name });
      if (!course) {
        course = await Course.create(courseData);
        console.log(`Created course: ${course.name}`);
      }
      createdCourses.push(course);
    }

    // Add sample batches for each course
    const batches = [];
    for (const course of createdCourses) {
      const batchNames = ['2023-2027', '2024-2028'];
      for (const batchName of batchNames) {
        let batch = await Batch.findOne({ courseName: course.name, name: batchName });
        if (!batch) {
          batch = await Batch.create({ courseName: course.name, name: batchName });
          console.log(`Created batch: ${batch.name} for course: ${course.name}`);
        }
        batches.push({ batch, course });
      }
    }

    // Add sample students
    const students = [
      { name: 'John Doe', email: 'john@example.com', course: createdCourses[0]._id, batch: '2023-2027', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', course: createdCourses[0]._id, batch: '2023-2027', password: 'password123' },
      { name: 'Bob Johnson', email: 'bob@example.com', course: createdCourses[1]._id, batch: '2024-2028', password: 'password123' },
      { name: 'Alice Brown', email: 'alice@example.com', course: createdCourses[2]._id, batch: '2023-2027', password: 'password123' }
    ];

    for (const studentData of students) {
      let student = await Student.findOne({ email: studentData.email });
      if (!student) {
        // Hash password
        const bcrypt = await import('bcrypt');
        studentData.password = await bcrypt.default.hash(studentData.password, 10);
        student = await Student.create(studentData);
        console.log(`Created student: ${student.name} (${student.email})`);
      }
    }

    console.log('Sample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();
