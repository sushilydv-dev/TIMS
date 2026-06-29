import User from "./user.js";
import Role from "./role.js";
import OTP from "./otp.js";
import Trainer from "./trainer.js";
import Student from "./student.js";
import Hr from "./hr.js";
import Department from "./department.js";
import Course from "./course.js";
import CourseModule from "./courseModule.js";
import Syllabus from "./syllabus.js";
import Batch from "./batch.js";
import BatchTrainer from "./batchTrainer.js";
import Enrollment from "./enrollment.js";
import Attendance from "./attendance.js";
import Project from "./project.js";
import ProjectSubmission from "./projectSubmission.js";
import StudyMaterial from "./studyMaterial.js";
import Fee from "./fee.js";
import Payment from "./payment.js";
import Assessment from "./assessment.js";
import AssessmentResult from "./assessmentResult.js";
import Certificate from "./certificate.js";
import CertificateSettings from "./certificateSettings.js";
import Notification from "./notification.js";
import InviteToken from "./inviteToken.js";
import Installment from "./installment.js";
import AppointmentRequest from "./appointmentRequest.js";

User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id" });

User.hasOne(Student, { foreignKey: "user_id", onDelete: "CASCADE" });
Student.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Trainer, { foreignKey: "user_id", onDelete: "CASCADE" });
Trainer.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Hr, { foreignKey: "user_id", onDelete: "CASCADE" });
Hr.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id" });

Notification.belongsTo(User, { foreignKey: "related_user_id", as: "relatedUser" });

Department.hasMany(Course, { foreignKey: "department_id", onDelete: "SET NULL" });
Course.belongsTo(Department, { foreignKey: "department_id" });

Course.hasMany(CourseModule, { foreignKey: "course_id", onDelete: "CASCADE" });
CourseModule.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(Syllabus, { foreignKey: "course_id", onDelete: "CASCADE" });
Syllabus.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(Batch, { foreignKey: "course_id", onDelete: "CASCADE" });
Batch.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(Project, { foreignKey: "course_id", onDelete: "CASCADE" });
Project.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(StudyMaterial, { foreignKey: "course_id", onDelete: "CASCADE" });
StudyMaterial.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(Assessment, { foreignKey: "course_id", onDelete: "CASCADE" });
Assessment.belongsTo(Course, { foreignKey: "course_id" });

// Keep one-to-many for backward compatibility (primary trainer)
Trainer.hasMany(Batch, { foreignKey: "trainer_id", onDelete: "SET NULL" });
Batch.belongsTo(Trainer, { foreignKey: "trainer_id", as: "trainer" });

// Many-to-many relationship between Batch and Trainer (additional trainers)
Batch.belongsToMany(Trainer, { 
  through: BatchTrainer, 
  foreignKey: "batch_id", 
  otherKey: "trainer_id",
  as: "trainers"
});
Trainer.belongsToMany(Batch, { 
  through: BatchTrainer, 
  foreignKey: "trainer_id", 
  otherKey: "batch_id",
  as: "batches"
});

Batch.hasMany(Enrollment, { foreignKey: "batch_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Batch, { foreignKey: "batch_id" });

Student.hasMany(Enrollment, { foreignKey: "student_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Student, { foreignKey: "student_id" });

Batch.hasMany(Attendance, { foreignKey: "batch_id", onDelete: "CASCADE" });
Attendance.belongsTo(Batch, { foreignKey: "batch_id" });

Student.hasMany(Attendance, { foreignKey: "student_id", onDelete: "CASCADE" });
Attendance.belongsTo(Student, { foreignKey: "student_id" });

Project.hasMany(ProjectSubmission, { foreignKey: "project_id", onDelete: "CASCADE" });
ProjectSubmission.belongsTo(Project, { foreignKey: "project_id" });

Student.hasMany(ProjectSubmission, { foreignKey: "student_id", onDelete: "CASCADE" });
ProjectSubmission.belongsTo(Student, { foreignKey: "student_id" });

Student.hasMany(Fee, { foreignKey: "student_id", onDelete: "CASCADE" });
Fee.belongsTo(Student, { foreignKey: "student_id" });

Fee.hasMany(Payment, { foreignKey: "fee_id", onDelete: "CASCADE", as: "payments" });
Payment.belongsTo(Fee, { foreignKey: "fee_id", as: "fee" });

Fee.hasMany(Installment, { foreignKey: "fee_id", onDelete: "CASCADE", as: "installments" });
Installment.belongsTo(Fee, { foreignKey: "fee_id", as: "fee" });

Installment.hasMany(Payment, { foreignKey: "installment_id", onDelete: "SET NULL", as: "payments" });
Payment.belongsTo(Installment, { foreignKey: "installment_id", as: "installment" });

Assessment.hasMany(AssessmentResult, { foreignKey: "assessment_id", onDelete: "CASCADE" });
AssessmentResult.belongsTo(Assessment, { foreignKey: "assessment_id" });

Student.hasMany(AssessmentResult, { foreignKey: "student_id", onDelete: "CASCADE" });
AssessmentResult.belongsTo(Student, { foreignKey: "student_id" });

Student.hasMany(Certificate, { foreignKey: "student_id", onDelete: "CASCADE" });
Certificate.belongsTo(Student, { foreignKey: "student_id" });

Batch.hasMany(Certificate, { foreignKey: "batch_id", onDelete: "CASCADE" });
Certificate.belongsTo(Batch, { foreignKey: "batch_id" });

User.hasMany(Certificate, { foreignKey: "approved_by", as: "approvedCertificates", onDelete: "SET NULL" });
Certificate.belongsTo(User, { foreignKey: "approved_by", as: "approver" });

User.hasMany(InviteToken, { foreignKey: "user_id", onDelete: "CASCADE" });
InviteToken.belongsTo(User, { foreignKey: "user_id" });

export {
  User,
  Role,
  OTP,
  Trainer,
  Student,
  Hr,
  Department,
  Course,
  CourseModule,
  Syllabus,
  Batch,
  Enrollment,
  Attendance,
  Project,
  ProjectSubmission,
  StudyMaterial,
  Fee,
  Payment,
  Assessment,
  AssessmentResult,
  Certificate,
  CertificateSettings,
  Notification,
  InviteToken,
  Installment,
  AppointmentRequest,
};
