import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function createDatabase() {
  let connection;

  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Sherin2001@",
      port: process.env.DB_PORT || 3306,
    });

    console.log("Connected to MySQL server...");

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "brewops_db";
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists.`);

    // Use the database
    await connection.execute(`USE \`${dbName}\``);

    // Read and execute SQL files in order
    const sqlFiles = [
      "01_users_table.sql",
      "02_suppliers_table.sql",
      "03_deliveries_table.sql",
      "04_payments_table.sql",
      "05_payment_statistics_view.sql",
      "06_indexes.sql",
      "08_update_supplier_ids.sql", // Migration for supplier ID format
    ];

    for (const sqlFile of sqlFiles) {
      const filePath = path.join(__dirname, sqlFile);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${sqlFile}...`);
        const sql = fs.readFileSync(filePath, "utf8");

        // Split SQL commands by semicolon and execute each one
        const commands = sql.split(";").filter((cmd) => cmd.trim());

        for (const command of commands) {
          if (command.trim()) {
            try {
              await connection.execute(command.trim());
            } catch (error) {
              // Ignore table already exists errors
              if (!error.message.includes("already exists")) {
                console.error(`Error executing command: ${error.message}`);
              }
            }
          }
        }
        console.log(`${sqlFile} executed successfully.`);
      } else {
        console.log(`File ${sqlFile} not found, skipping...`);
      }
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\nTables created:");
    console.log("- users");
    console.log("- suppliers (with sample data)");
    console.log("- deliveries");
    console.log("- payments");
    console.log("- payment_statistics (view)");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup - ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  createDatabase();
}

export default createDatabase;
