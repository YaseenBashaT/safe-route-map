import { Link } from 'react-router-dom';
import { MapPin, Shield, AlertTriangle, LogIn, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card shadow-card border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  Accident Heatmap & Safe Routes
                </h1>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Report Accident Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/report">
                  <Button variant="outline" size="sm" className="gap-2 border-warning/50 text-warning hover:bg-warning/10">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Report Accident</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report a new accident</p>
              </TooltipContent>
            </Tooltip>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
                  <User className="w-3.5 h-3.5" />
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={logout}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign out of your account</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/auth">
                    <Button variant="default" size="sm" className="gap-2">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in to your account</p>
                </TooltipContent>
              </Tooltip>
            )}

            <span className="text-xs sm:text-sm text-muted-foreground font-medium px-3 py-1.5 bg-muted rounded-full">
              India
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
