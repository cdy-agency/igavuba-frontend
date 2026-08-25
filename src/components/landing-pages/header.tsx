"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import React, { useState } from 'react';
import { Heart, User, Settings, LogOut, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useWishlistContext } from '@/providers/wishlist-provider';

const SearchModal = dynamic(() => import('@/components/search/search-modal'), { ssr: false });

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';


export default function LandingHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { wishlistCount } = useWishlistContext();

  const getDashboardRoute = () => '/dashboard';
  const wishlistHref = '/wishlist';

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/courses", label: "COURSES" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex py-5 items-center justify-between px-4 md:px-8 lg:px-32">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-3">
          <Image src="/igavuba-logo.png" alt="Logo" width={120} height={100} />
        </div>
        </Link>

        {/* Navbar Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={index}
                href={item.href}
                className={`relative text-sm font-medium transition-colors group ${isActive ? 'text-foreground' : 'text-foreground-muted hover:text-secondary'}`}
              >
                {item.label}
                <span className={`absolute left-0 -bottom-1 h-0.5 transition-all duration-300 ${isActive ? 'w-full bg-primary' : 'w-0 group-hover:w-full group-hover:bg-primary bg-transparent'}`}></span>
              </Link>
            );
          })}
        </nav>

        {/* Icons and Sign-in / Profile */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center gap-3">
            <Link
              href={wishlistHref}
              aria-label="Wishlist"
              className="relative p-2 rounded-md hover:bg-muted transition-colors"
            >
              <Heart className="h-5 w-5 text-foreground-muted" />
              {wishlistCount > 0 ? (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </Badge>
              ) : null}
            </Link>

            <button aria-label="Search" onClick={() => setIsOpen(true)} className="p-2 rounded-md hover:bg-muted transition-colors">
              <Search className="h-5 w-5 text-foreground-muted" />
            </button>

            {user ? (
              <>
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-primary-subtle flex items-center justify-center text-sm font-semibold text-primary">{user.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'U'}</div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>

                    <DropdownMenuItem>
                      <Link href={getDashboardRoute()} className="w-full block">
                        <div className="flex items-center gap-2"><User className="h-4 w-4" /> Dashboard</div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Link href="/profile" className="w-full block">
                        <div className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Link href="/settings" className="w-full block">
                        <div className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        void logout();
                      }}
                    >
                      <div className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Log out</div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
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
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-3 lg:hidden">
          <Link href={wishlistHref} aria-label="Wishlist" className="relative p-2 rounded-md hover:bg-muted transition-colors">
            <Heart className="h-5 w-5 text-foreground-muted" />
            {wishlistCount > 0 ? (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </Badge>
            ) : null}
          </Link>

          <button aria-label="Search" onClick={() => setIsOpen(true)} className="p-2 rounded-md hover:bg-muted transition-colors">
            <Search className="h-5 w-5 text-foreground-muted" />
          </button>

          {user ? <NotificationBell /> : null}

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
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full block">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    void logout();
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {isOpen && <SearchModal open={isOpen} onClose={() => setIsOpen(false)} />}
    </header>
  );
}
