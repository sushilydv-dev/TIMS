import sequelize from "./db.js";

async function tableExists(tableName) {
  const [rows] = await sequelize.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :table LIMIT 1`,
    { replacements: { table: tableName } },
  );
  return rows.length > 0;
}

async function columnType(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = :table AND column_name = :column`,
    { replacements: { table: tableName, column: columnName } },
  );
  return rows[0]?.data_type ?? null;
}

async function columnExists(tableName, columnName) {
  const type = await columnType(tableName, columnName);
  return Boolean(type);
}

/**
 * Safe migrations before Sequelize alter — avoids integer→varchar failures on students.
 */
export async function migrateStudentsSchema() {
  if (!(await tableExists("students"))) {
    return;
  }

  if (await columnExists("students", "college _name")) {
    await sequelize.query(
      'ALTER TABLE "students" RENAME COLUMN "college _name" TO "college_name";',
    );
    console.log("Renamed students.college _name → college_name");
  }

  const phoneType = await columnType("students", "phone");
  if (phoneType === "integer" || phoneType === "bigint" || phoneType === "smallint") {
    await sequelize.query(`
      ALTER TABLE "students"
      ALTER COLUMN "phone" DROP DEFAULT;
    `);
    await sequelize.query(`
      ALTER TABLE "students"
      ALTER COLUMN "phone" TYPE VARCHAR(255)
      USING CASE
        WHEN "phone" IS NULL THEN ''
        ELSE "phone"::text
      END;
    `);
    await sequelize.query(`
      ALTER TABLE "students"
      ALTER COLUMN "phone" SET DEFAULT '';
    `);
    console.log("Migrated students.phone to VARCHAR");
  }

  const codeType = await columnType("students", "student_code");
  if (codeType === "integer" || codeType === "bigint" || codeType === "smallint") {
    await sequelize.query(`
      ALTER TABLE "students"
      ALTER COLUMN "student_code" TYPE VARCHAR(64)
      USING CASE
        WHEN "student_code" IS NULL THEN 'STU-UNKNOWN'
        ELSE 'STU-' || "student_code"::text
      END;
    `);
    console.log("Migrated students.student_code to VARCHAR");
  }

  if (!(await columnExists("students", "college_name"))) {
    await sequelize.query(`
      ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "college_name" VARCHAR(255) NOT NULL DEFAULT '';
    `);
  }
}
