import connectDB from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSuppliersTable() {
  try {
    console.log("🔧 Creating suppliers table...");

    const db = await connectDB();

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, "createSuppliersTable.sql");
    const sqlCommands = fs.readFileSync(sqlFilePath, "utf8");

    // Split commands by semicolon and filter out empty ones
    const commands = sqlCommands
      .split(";")
      .map((cmd) => cmd.trim())
      .filter(
        (cmd) =>
          cmd.length > 0 && !cmd.startsWith("--") && !cmd.startsWith("/*")
      );

    console.log(`📝 Executing ${commands.length} SQL commands...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await db.execute(command);
          console.log(`✅ Command ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing command ${i + 1}:`, error.message);
          console.error("Command:", command);
        }
      }
    }

    console.log("🎉 Suppliers table creation completed!");

    // Verify tables were created
    const [tables] = await db.execute("SHOW TABLES LIKE 'suppliers'");
    if (tables.length > 0) {
      console.log("✅ Suppliers table exists");

      // Show table structure
      const [structure] = await db.execute("DESCRIBE suppliers");
      console.log("📋 Suppliers table structure:");
      console.table(structure);
    } else {
      console.log("❌ Suppliers table was not created");
    }

    const [supplyTables] = await db.execute(
      "SHOW TABLES LIKE 'supply_records'"
    );
    if (supplyTables.length > 0) {
      console.log("✅ Supply_records table exists");
    } else {
      console.log("❌ Supply_records table was not created");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating suppliers table:", error);
    process.exit(1);
  }
}

createSuppliersTable();
