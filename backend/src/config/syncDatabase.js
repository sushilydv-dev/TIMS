import sequelize from "./db.js";
import { migrateStudentsSchema } from "./migrateStudentsSchema.js";

/**
 * Applies schema changes (new tables/columns) including departments and course links.
 * Set DB_SYNC_ALTER=false in production if you use migrations instead.
 */
export async function syncDatabase() {
  const alter = process.env.DB_SYNC_ALTER !== "false";

  if (alter) {
    try {
      await migrateStudentsSchema();
    } catch (err) {
      console.warn("students schema migration warning:", err.message);
    }

    const dropConstraints = [
      'ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_created_by_fkey";',
      'ALTER TABLE "batches" DROP CONSTRAINT IF EXISTS "batches_assigned_by_fkey";',
    ];
    for (const sql of dropConstraints) {
      try {
        await sequelize.query(sql);
      } catch {
        /* table may not exist yet on first boot */
      }
    }

    // Drop NOT NULL constraint from enrollments.batch_id
    try {
      await sequelize.query(`
        ALTER TABLE "enrollments" 
        ALTER COLUMN "batch_id" DROP NOT NULL
      `);
      console.log("Successfully dropped NOT NULL constraint from enrollments.batch_id");
    } catch (err) {
      console.warn("enrollments.batch_id NOT NULL constraint warning:", err.message);
    }
  }

  try {
    await sequelize.sync({ alter });
    console.log(`Database schema synced (alter: ${alter})`);
  } catch (err) {
    console.warn("Database alter sync failed, falling back to sync without alter:", err.message);
    await sequelize.sync({ alter: false });
    console.log("Database schema synced successfully without alter.");
  }
}
