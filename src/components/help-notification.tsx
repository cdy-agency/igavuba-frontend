"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Phone, 
  X, 
  HelpCircle,
  Clock,
  Users,
  Shield
} from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HelpNotificationProps {
  className?: string;
}

export const HelpNotification: React.FC<HelpNotificationProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Show notification after 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('help-notification-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-hide after 30 seconds if not interacted with
  useEffect(() => {
    if (isVisible) {
      const autoHideTimer = setTimeout(() => {
        if (!isDialogOpen) {
          setIsVisible(false);
        }
      }, 30000);

      return () => clearTimeout(autoHideTimer);
    }
  }, [isVisible, isDialogOpen]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('help-notification-dismissed', 'true');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/+250729119833', '_blank');
    setIsDialogOpen(false);
  };

  const handleCallClick = () => {
    window.open('tel:+250787910406');
    setIsDialogOpen(false);
  };

  const resetDismissal = () => {
    localStorage.removeItem('help-notification-dismissed');
    setIsVisible(true);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={resetDismissal}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Need Help?
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main Notification */}
      <div className={`fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-2 duration-300 ${className}`}>
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-5 max-w-sm w-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Need Help?</h3>
                <p className="text-xs text-gray-500">We{"'"}re here to assist you!</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Get instant support for your job search or hiring needs. Our expert team is ready to help you succeed!
          </p>

          <div className="flex gap-3">
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Chat with Support
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Start a WhatsApp conversation with our support team. We typically respond within minutes during business hours.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">WhatsApp Support</p>
                        <p className="text-sm text-blue-600">+250 729 119 833</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Available 24/7 for urgent queries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Expert team ready to help</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>Secure and private conversations</span>
                    </div>
                  </div>
                </div>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWhatsAppClick} className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Call Support
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Speak directly with our support team. We{"'"}re available Monday to Friday, 8 AM to 6 PM.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Phone Support</p>
                        <p className="text-sm text-blue-600">+250 784 886 470</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Direct access to experts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>Immediate assistance</span>
                    </div>
                  </div>
                </div>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCallClick} className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                Quick Response
              </Badge>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Don{"'"}t show again
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200">
          <HelpCircle className="h-6 w-6" />
        </div>
      </div>
    </>
  );
};

export default HelpNotification;
