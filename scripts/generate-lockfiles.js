const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const projects = [
  { name: "frontend", path: "." },
  { name: "backend", path: "server" },
]

console.log("Generating package-lock.json files...")

projects.forEach((project) => {
  const projectPath = path.resolve(__dirname, "..", project.path)
  const packageJsonPath = path.join(projectPath, "package.json")

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`Skipping ${project.name}: package.json not found at ${packageJsonPath}`)
    return
  }

  console.log(`\nProcessing ${project.name} at ${projectPath}...`)
  try {
    // Change directory to the project path
    process.chdir(projectPath)

    // Run npm install --package-lock-only
    console.log(`Running 'npm install --package-lock-only' for ${project.name}...`)
    execSync("npm install --package-lock-only", { stdio: "inherit" })
    console.log(`Successfully generated package-lock.json for ${project.name}.`)
  } catch (error) {
    console.error(`Error generating package-lock.json for ${project.name}:`, error.message)
  } finally {
    // Change back to the original directory to avoid issues with subsequent projects
    process.chdir(path.resolve(__dirname, ".."))
  }
})

console.log("\nFinished generating package-lock.json files.")
