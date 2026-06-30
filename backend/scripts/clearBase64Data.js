import sequelize from "../src/config/db.js";
import { Op } from "sequelize";
import User from "../src/models/user.js";
import Student from "../src/models/student.js";
import Course from "../src/models/course.js";
import StudyMaterial from "../src/models/studyMaterial.js";
import ProjectSubmission from "../src/models/projectSubmission.js";

async function clearBase64Data() {
  try {
    console.log("Starting to clear base64 data from database...");
    
    // Clear base64 data from users.profile_img
    const userCount = await User.update(
      { profile_img: "" },
      { 
        where: {
          profile_img: {
            [Op.like]: "data:%"
          }
        }
      }
    );
    console.log(`Cleared base64 from ${userCount[0]} user profile images`);
    
    // Clear base64 data from students.profile_img
    const studentCount = await Student.update(
      { profile_img: "" },
      { 
        where: {
          profile_img: {
            [Op.like]: "data:%"
          }
        }
      }
    );
    console.log(`Cleared base64 from ${studentCount[0]} student profile images`);
    
    // Clear base64 data from courses.thumbnail_url
    const courseCount = await Course.update(
      { thumbnail_url: null },
      { 
        where: {
          thumbnail_url: {
            [Op.like]: "data:%"
          }
        }
      }
    );
    console.log(`Cleared base64 from ${courseCount[0]} course thumbnails`);
    
    // Clear base64 data from study_material.file_url
    const materialCount = await StudyMaterial.update(
      { file_url: "" },
      { 
        where: {
          file_url: {
            [Op.like]: "data:%"
          }
        }
      }
    );
    console.log(`Cleared base64 from ${materialCount[0]} study materials`);
    
    // Clear base64 data from project_submissions.file_url
    const projectCount = await ProjectSubmission.update(
      { file_url: "" },
      { 
        where: {
          file_url: {
            [Op.like]: "data:%"
          }
        }
      }
    );
    console.log(`Cleared base64 from ${projectCount[0]} project submissions`);
    
    console.log("✅ Base64 data cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing base64 data:", error);
    process.exit(1);
  }
}

clearBase64Data();
