const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔧 Generating package-lock.json files...")

// Generate lock file for frontend
console.log("📦 Generating frontend package-lock.json...")
try {
  if (!fs.existsSync("package-lock.json")) {
    execSync("npm install --package-lock-only", { stdio: "inherit" })
    console.log("✅ Frontend package-lock.json generated")
  } else {
    console.log("✅ Frontend package-lock.json already exists")
  }
} catch (error) {
  console.error("❌ Failed to generate frontend package-lock.json:", error.message)
}

// Generate lock file for backend
console.log("📦 Generating backend package-lock.json...")
try {
  const serverDir = path.join(__dirname, "..", "server")
  if (!fs.existsSync(path.join(serverDir, "package-lock.json"))) {
    execSync("npm install --package-lock-only", {
      cwd: serverDir,
      stdio: "inherit",
    })
    console.log("✅ Backend package-lock.json generated")
  } else {
    console.log("✅ Backend package-lock.json already exists")
  }
} catch (error) {
  console.error("❌ Failed to generate backend package-lock.json:", error.message)
}

console.log("🎉 Lock file generation complete!")
