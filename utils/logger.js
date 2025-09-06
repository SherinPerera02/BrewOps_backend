import fs from "fs";
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: ${message}${
      data ? ` - ${JSON.stringify(data)}` : ""
    }\n`;

    console.log(logEntry.trim());
    fs.appendFileSync(path.join(logsDir, "app.log"), logEntry);
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}${
      error ? ` - ${error.stack || error}` : ""
    }\n`;

    console.error(logEntry.trim());
    fs.appendFileSync(path.join(logsDir, "error.log"), logEntry);
  },

  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] WARN: ${message}${
      data ? ` - ${JSON.stringify(data)}` : ""
    }\n`;

    console.warn(logEntry.trim());
    fs.appendFileSync(path.join(logsDir, "app.log"), logEntry);
  },
};

module.exports = logger;
