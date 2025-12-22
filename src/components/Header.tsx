import { MapPin, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card shadow-card border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">
                Accident Heatmap & Safe Routes
              </h1>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-medium px-3 py-1.5 bg-muted rounded-full">
            India
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
