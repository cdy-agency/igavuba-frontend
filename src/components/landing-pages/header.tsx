"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Menu } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LandingHeader() {
  const { user, logout } = useAuth();

  // Role-based dashboard route
  const getDashboardRoute = () => {
    switch (user?.role) {
      case "student":
        return "/student";
      case "instructor":
        return "/instructor";
      case "institution":
        return "/institution";
      case "admin":
        return "/admin";
      default:
        return "/dashboard";
    }
  };

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/courses", label: "COURSES" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex py-5 items-center justify-between px-4 md:px-8 lg:px-32">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-secondary" />
          <span className="text-xl font-bold text-foreground">IGA-VUBA</span>
        </div>

        {/* Navbar Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="relative text-sm font-medium text-foreground-muted hover:text-secondary transition-colors group"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-secondary to-accent transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Logged-in Dropdown OR Sign-in Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          {!user ? (
            <>
              <Button
                variant="ghost"
                className="text-foreground-muted hover:text-[var(--coursera-blue)] font-medium transition-colors"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="text-panel-foreground font-semibold px-5 py-2 rounded-lg shadow-sm transition-transform duration-200 hover:scale-105 brand-btn-primary">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer">
                <Image
                  src={"/user-286.png"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />

                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-40">
                <DropdownMenuItem>
                  <Link href={getDashboardRoute()} className="w-full block">
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    void logout();
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-3 lg:hidden">
          {!user ? (
            <Button
              variant="ghost"
              className="text-foreground-muted hover:text-[var(--coursera-blue)] font-medium"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Image
                  src={"/user-286.png"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={getDashboardRoute()} className="w-full block">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    void logout();
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted rounded-md"
          >
            <Menu className="h-6 w-6 text-foreground-muted" />
          </Button>
        </div>
      </div>
    </header>
  );
}
