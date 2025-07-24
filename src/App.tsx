import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BookAppointment from "./pages/BookAppointment"
import Appointments from "./pages/Appointments"
import Dashboard from "./pages/Dashboard"
import Header from "./components/Header"
import { AppointmentProvider } from "./context/AppointmentContext"

function App() {
  return (
    <Router>
      <AppointmentProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AppointmentProvider>
    </Router>
  )
}

export default App
