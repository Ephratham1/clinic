import { Link } from "react-router-dom"
import ModeToggle from "./ModeToggle" // Assuming you have a ModeToggle component

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          ClinicApp
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/book" className="hover:underline">
            Book Appointment
          </Link>
          <Link to="/appointments" className="hover:underline">
            View Appointments
          </Link>
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
