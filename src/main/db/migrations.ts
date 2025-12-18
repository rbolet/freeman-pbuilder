import { Sequelize, QueryInterface } from "sequelize";
import path from "node:path";
import fs from "node:fs";

/**
 * Migration interface that all migration files must implement
 */
export interface Migration {
  up: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
}

/**
 * Table to track which migrations have been run
 */
const MIGRATIONS_TABLE = "sequelize_meta";

/**
 * Ensure the migrations tracking table exists
 */
async function ensureMigrationsTable(sequelize: Sequelize): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const tableExists = await queryInterface
    .showAllTables()
    .then((tables) => tables.includes(MIGRATIONS_TABLE));

  if (!tableExists) {
    await queryInterface.createTable(MIGRATIONS_TABLE, {
      name: {
        type: "VARCHAR(255)",
        allowNull: false,
        primaryKey: true,
      },
    });
  }
}

/**
 * Get list of migrations that have already been run
 */
async function getExecutedMigrations(sequelize: Sequelize): Promise<string[]> {
  const [results] = await sequelize.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name ASC`);
  return (results as Array<{ name: string }>).map((row) => row.name);
}

/**
 * Get all migration files from the migrations directory
 */
function getMigrationFiles(migrationsDir: string): string[] {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    .sort();
}

/**
 * Run pending migrations
 * @param sequelize - The Sequelize instance
 * @param migrationsDir - Optional custom migrations directory (for testing)
 */
export async function runMigrations(sequelize: Sequelize, migrationsDir?: string): Promise<void> {
  const migDir = migrationsDir ?? path.join(__dirname, "migrations");

  // Ensure the migrations table exists
  await ensureMigrationsTable(sequelize);

  // Get list of executed migrations
  const executedMigrations = await getExecutedMigrations(sequelize);

  // Get all migration files
  const migrationFiles = getMigrationFiles(migDir);

  // Find pending migrations (files that haven't been executed)
  const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));

  if (pendingMigrations.length === 0) {
    console.log("[DB] No pending migrations");
    return;
  }

  console.log(`[DB] Running ${pendingMigrations.length} pending migration(s)`);

  // Run each pending migration
  for (const migrationFile of pendingMigrations) {
    const migrationPath = path.join(migDir, migrationFile);
    console.log(`[DB] Running migration: ${migrationFile}`);

    try {
      // Import the migration module
      const migration: Migration = await import(migrationPath);

      // Run the up migration within a transaction
      await sequelize.transaction(async (transaction) => {
        const queryInterface = sequelize.getQueryInterface();

        await migration.up(queryInterface, sequelize);

        await sequelize.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (:name)`, {
          replacements: { name: migrationFile },
          transaction,
        });
      });

      console.log(`[DB] Migration completed: ${migrationFile}`);
    } catch (error) {
      console.error(`[DB] Migration failed: ${migrationFile}`, error);
      throw error;
    }
  }

  console.log("[DB] All migrations completed successfully");
}
