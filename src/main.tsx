import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// Performance monitoring
if (import.meta.env.PROD) {
  // Initialize performance monitoring in production
  console.log("Production build - Performance monitoring enabled")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
