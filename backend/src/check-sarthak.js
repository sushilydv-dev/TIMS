import sequelize from "./config/db.js";
import Student from "./models/student.js";
import User from "./models/user.js";
import Role from "./models/role.js";
import Fee from "./models/fee.js";
import Installment from "./models/installment.js";
import Enrollment from "./models/enrollment.js";
import Batch from "./models/batch.js";
import Course from "./models/course.js";
import "./models/associations.js";

async function run() {
  try {
    const student = await Student.findOne({
      where: { id: "f621e296-576a-4cf9-a2d2-177d3ad24571" },
      include: [
        { model: User },
        { model: Fee, include: [{ model: Installment, as: "installments" }] },
        { model: Enrollment, include: [{ model: Batch, include: [{ model: Course }] }] }
      ]
    });

    console.log("Student Details from Database:", JSON.stringify(student.toJSON(), null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Query failed:", error);
    process.exit(1);
  }
}

run();
