import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <header className="sticky top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50">
      <div className="w-full flex items-center justify-between h-14 pl-6 pr-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM17 17H7V16H17V17ZM17 14H7V13H17V14ZM17 11H7V10H17V11ZM14 8H7V7H14V8Z" fill="white"/>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">Norma</span>
        </Link>
        
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            
            {mobileMenuOpen && (
              <div className="absolute top-14 left-0 right-0 bg-background border-b p-4 flex flex-col gap-2 animate-fade-in-down">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-base">Home</Button>
                </Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-base">Dashboard</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link to="/" className="text-base font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-base font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            </nav>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </Button>
            <Link to="/dashboard">
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;