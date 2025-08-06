import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Home, 
  Search, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Plus,
  Bell,
  Heart,
  Hash,
  Shield,
  CheckCircle,
  Menu,
  X
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

const Navigation = () => {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isAdmin = profile?.role === 'admin'
  const isVerified = profile?.is_verified

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/explore', icon: Search, label: 'Explorar' },
    { path: '/topics', icon: Hash, label: 'Temas' },
    { path: '/messages', icon: MessageCircle, label: 'Mensajes' },
    { path: '/profile', icon: User, label: 'Perfil' }
  ]

  // Agregar elementos especiales según el rol
  if (!isVerified) {
    navItems.push({ path: '/verification', icon: CheckCircle, label: 'Verificación' })
  }

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' })
  }

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:p-4 lg:z-30">
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">RenkoNet</h1>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span className="font-medium">{item.label}</span>
                {item.path === '/verification' && !isVerified && (
                  <Badge variant="secondary" className="ml-auto text-xs">Nuevo</Badge>
                )}
              </Link>
            )
          })}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.username || 'Usuario'}
                </p>
                {isVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={isAdmin ? 'destructive' : 'outline'} className="text-xs">
                  {profile?.role || 'normal'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">RenkoNet</h1>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.path === '/verification' && !isVerified && (
                      <Badge variant="secondary" className="ml-auto text-xs">Nuevo</Badge>
                    )}
                  </Link>
                )
              })}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-3 mb-4 px-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile?.username || 'Usuario'}
                      </p>
                      {isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <Badge variant={isAdmin ? 'destructive' : 'outline'} className="text-xs">
                      {profile?.role || 'normal'}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation - Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors min-w-0 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.path === '/verification' && !isVerified && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs truncate max-w-full">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16"></div>
      <div className="lg:hidden h-16"></div>
    </>
  )
}

export default Navigation

