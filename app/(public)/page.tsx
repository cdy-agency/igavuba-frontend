"use client"

import HeroSection from "@/components/heroSection"
import LandingHeader from "@/components/landingpages/header"
import LandingCategories from "@/components/landingpages/categories"
import LandingCta from "@/components/landingpages/cta"
import HelpNotification from "@/components/help-notification";
import { WorkflowSection } from "@/components/landingpages/howItWorks"
import LandingCourses from "@/components/landingpages/landingCourses"
import { LandingFooter } from "@/components/landingpages/landingFooter"
import { FAQSection } from "@/components/landingpages/faq-section"


export default function ELearningLanding() {

  return (
    <div className="min-h-screen bg-white">
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
