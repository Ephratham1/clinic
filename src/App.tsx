import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "./components/Header"
import Home from "./pages/Home"
import Appointments from "./pages/Appointments"
import BookAppointment from "./pages/BookAppointment"
import Dashboard from "./pages/Dashboard"
import { AppointmentProvider } from "./context/AppointmentContext"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="clinic-theme">
      <AppointmentProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/book" element={<BookAppointment />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AppointmentProvider>
    </ThemeProvider>
  )
}

export default App
