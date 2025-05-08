import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import WalletConnector from "./WalletConnector";
import { Layers, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar: string;
  walletAddress: string;
  isAuthenticated: boolean;
}

const Header = () => {
  const [location, setLocation] = useLocation();
  const { account } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigationItems = [
    { name: "Dashboard", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "My Jobs", path: "/jobs" },
    { name: "Documentation", path: "/docs" },
  ];

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setUserData(data);
          } else {
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, [account]); // Refetch when wallet account changes

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserData(null);
      setLocation('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userData?.name) return 'U';
    return userData.name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-neutral-lighter">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Layers className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-semibold text-neutral-dark">LithoChain</span>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${
                    location === item.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-neutral border-b-2 border-transparent hover:text-neutral-dark hover:border-neutral-light"
                  } px-1 py-4 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            {/* Show wallet connector if authenticated */}
            {userData?.isAuthenticated && <WalletConnector />}
            
            <div className="ml-4 relative flex-shrink-0">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
            
            <div className="ml-4 relative flex-shrink-0">
              {userData?.isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1">
                      <span className="sr-only">Open user menu</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback className="bg-accent text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {userData.name || 'My Account'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setLocation('/login')}
                  className="bg-primary text-white hover:bg-primary-dark"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${
                location === item.path
                  ? "bg-primary-light bg-opacity-10 text-primary block pl-3 pr-4 py-2 border-l-4 border-primary"
                  : "hover:bg-neutral-lightest hover:text-neutral-dark block pl-3 pr-4 py-2 border-l-4 border-transparent"
              } text-base font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
