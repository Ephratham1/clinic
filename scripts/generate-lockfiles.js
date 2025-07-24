#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔧 Generating package-lock.json files...")

// Generate lockfile for frontend
if (fs.existsSync("package.json")) {
  console.log("📦 Generating frontend package-lock.json...")
  try {
    execSync("npm install --package-lock-only", { stdio: "inherit" })
    console.log("✅ Frontend package-lock.json generated")
  } catch (error) {
    console.error("❌ Failed to generate frontend package-lock.json:", error.message)
  }
}

// Generate lockfile for backend
const serverPath = path.join(__dirname, "..", "server")
if (fs.existsSync(path.join(serverPath, "package.json"))) {
  console.log("📦 Generating backend package-lock.json...")
  try {
    execSync("npm install --package-lock-only", {
      cwd: serverPath,
      stdio: "inherit",
    })
    console.log("✅ Backend package-lock.json generated")
  } catch (error) {
    console.error("❌ Failed to generate backend package-lock.json:", error.message)
  }
}

console.log("🎉 Package lock files generation complete!")
