"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  platform: [
    { name: "Home", href: "/" },
    { name: "Courses", href: "#courses" },
    { name: "Forum", href: "/forums" },
    { name: "Certificate Checker", href: "/certificate-checker" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

export function LandingFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const whatsappLink = "https://wa.me/+250 729 119 833";

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer
      id="contact"
      className="relative bg-slate-900 text-white scroll-mt-20 dark:bg-slate-900 container px-6 md:px-8 lg:px-32"
    >
      <div className="container">
        <div className="container-inner">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 py-10">
            {/* Left Section - Branding */}
            <div className="">
              {/* <div className="flex justify-center lg:justify-start space-y-8 flex-col">
                <div className="relative h-16 w-16">
                  <Image
                    src="/oazislogo.png"
                    alt="OAZIS Health Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div> */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-[var(--coursera-blue)] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">IGA-VUBA</span>
              </div>
              <p className="text-sm text-slate-300 mt-8 max-w-xs lg:mx-0">
                Connecting learners with world-class education from leading
                institutions worldwide.
              </p>
            </div>

            {/* Platform Links */}
            <div className="">
              <h3 className="text-sm font-semibold mb-3 text-white uppercase">
                Platform
              </h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info & Social */}
            <div className="">
              <h3 className="text-sm font-semibold mb-3 text-white uppercase">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-slate-300">Rwanda, Kigali</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href="tel:+250791896223"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      +250 729 119 833
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href="mailto:info@oazis.rw"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      info@igavuba.rw
                    </a>
                  </div>
                </div>
                {/* Social Media Links */}
                <div className="flex items-center lg:justify-start gap-3 pt-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                        aria-label={social.name}
                      >
                        <Icon className="w-4 h-4" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-6 pb-8 border-t border-slate-700">
            <div className="flex flex-col items-center gap-2 text-center py-4">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} IGA-VUBA. All rights reserved.
              </p>
              <p className="text-xs text-slate-400">
                Powered by{" "}
                <a
                  href="https://www.cdyagency.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-medium"
                >
                  CDY Agency
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
