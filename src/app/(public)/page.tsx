"use client"

import HeroSection from "@/components/heroSection"
import LandingHeader from "@/components/landing-pages/header"
import LandingCategories from "@/components/landing-pages/categories"
import LandingCta from "@/components/landing-pages/cta"
import HelpNotification from "@/components/help-notification";
import { WorkflowSection } from "@/components/landing-pages/howItWorks"
import LandingCourses from "@/components/landing-pages/landingCourses"
import { LandingFooter } from "@/components/landing-pages/landingFooter"
import { FAQSection } from "@/components/landing-pages/faq-section"


export default function ELearningLanding() {

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <WorkflowSection />
      <LandingCategories />
      <LandingCourses />
      <LandingCta />
      <FAQSection />
      <LandingFooter />
      <HelpNotification />
    </div>
  )
}
