import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import WalletConnector from "./WalletConnector";
import { Layers, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [location] = useLocation();
  const { account } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "My Jobs", path: "/jobs" },
    { name: "Documentation", path: "/docs" },
  ];

  const userInitials = "JS"; // This would come from user profile data

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
            <WalletConnector />
            
            <div className="ml-4 relative flex-shrink-0">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
            
            <div className="ml-4 relative flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center">
                      <span>{userInitials}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
