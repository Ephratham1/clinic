import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Plus, BarChart3 } from "lucide-react"

const Header = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">ClinicCare</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <Button variant={isActive("/") ? "default" : "ghost"} asChild>
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>

            <Button variant={isActive("/appointments") ? "default" : "ghost"} asChild>
              <Link to="/appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </Link>
            </Button>

            <Button variant={isActive("/book") ? "default" : "ghost"} asChild>
              <Link to="/book" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Book</span>
              </Link>
            </Button>

            <Button variant={isActive("/dashboard") ? "default" : "ghost"} asChild>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
