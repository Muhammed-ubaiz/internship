import mongoose from 'mongoose';
import Student from './Model/Studentsmodel.js';
import Course from './Model/Coursemodel.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateStudents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db');
    console.log('Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students to migrate`);

    let updatedCount = 0;

    for (const student of students) {
      // Check if course is already an ObjectId
      if (mongoose.Types.ObjectId.isValid(student.course)) {
        console.log(`Student ${student.name} already has ObjectId course reference`);
        continue;
      }

      // If course is a string, find the course by name
      if (typeof student.course === 'string') {
        const courseDoc = await Course.findOne({ name: student.course });
        if (courseDoc) {
          student.course = courseDoc._id;
          await student.save();
          updatedCount++;
          console.log(`Updated student ${student.name} with course ObjectId`);
        } else {
          console.log(`Warning: Course "${student.course}" not found for student ${student.name}`);
        }
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} students.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateStudents();
