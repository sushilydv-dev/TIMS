import Department from "../models/department.js";

const DEFAULT_DEPARTMENTS = [
  {
    name: "Technology",
    code: "TECH",
    description:
      "Software engineering, AI, and technical training programs (e.g. MERN Stack, AI).",
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "HR operations, people management, and workplace training courses.",
  },
  {
    name: "Business & Operations",
    code: "OPS",
    description: "Business processes, operations, and organizational development.",
  },
];

export async function seedDepartments() {
  for (const dept of DEFAULT_DEPARTMENTS) {
    const [record, created] = await Department.findOrCreate({
      where: { code: dept.code },
      defaults: dept,
    });

    if (!created) {
      await record.update({
        name: dept.name,
        description: dept.description,
      });
    }
  }

  console.log("Departments synced successfully");
}
