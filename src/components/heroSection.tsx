"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface SlideData {
  id: string
  title: string
  subtitle: string
  industry: string
  bgImage: string
  consultationImage: string
}

const slides: SlideData[] = [
  {
    id: "introduction",
    title: "Welcome to the E-Learning Platform",
    subtitle:
      "Discover how our platform empowers learners through interactive content, expert guidance, and industry-aligned skills development.",
    industry: "Platform Overview",
    bgImage: "/e-learning.jpg",
    consultationImage: "/images/consultation-intro.png",
  },
  {
    id: "ai_course",
    title: "Introduction to Artificial Intelligence & Machine Learning",
    subtitle:
      "Learn the fundamentals of AI and ML, explore real-world use cases, and develop models to solve business problems using data-driven insights.",
    industry: "AI & Data Science",
    bgImage: "/ai.png",
    consultationImage: "/images/consultation-ai.png",
  },
  {
    id: "fintech_course",
    title: "FinTech: The Future of Finance",
    subtitle:
      "Understand how digital finance works, including blockchain, payment gateways, and compliance. Build your own secure and scalable financial apps.",
    industry: "Financial Technology",
    bgImage: "/finance.webp",
    consultationImage: "/images/consultation-fintech.png",
  },
  {
    id: "cybersecurity_course",
    title: "Cybersecurity & Ethical Hacking Essentials",
    subtitle:
      "Learn how to protect digital systems and networks from cyber threats. Get hands-on with ethical hacking, security protocols, and real-world scenarios.",
    industry: "Cybersecurity",
    bgImage: "/cyber.jpg",
    consultationImage: "/images/consultation-cyber.png",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [mounted, setMounted] = useState(false)

  const SLIDE_DURATION = 5000 // 5 seconds per slide
  const PROGRESS_INTERVAL = 50 // Update progress every 50ms

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100

        if (newProgress >= 100) {
          setCurrentSlide((current) => (current + 1) % slides.length)
          return 0
        }

        return newProgress
      })
    }, PROGRESS_INTERVAL)

    return () => clearInterval(progressTimer)
  }, [currentSlide, isAutoPlaying])

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0)
  }, [currentSlide])

  useEffect(() => {
    setMounted(true)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)
  }

  const currentSlideData = slides[currentSlide]

  // Helper functions to categorize slides
  const getPreviousSlides = () => {
    if (currentSlide === 0) return []
    return slides.slice(0, currentSlide)
  }

  const getUpcomingSlides = () => {
    if (currentSlide === slides.length - 1) return []
    return slides.slice(currentSlide + 1)
  }

  if (!mounted) {
    return (
      <div className="relative h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] bg-black overflow-hidden m-2 md:m-4 rounded-lg">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex p-2 md:p-4 items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] bg-black overflow-hidden m-2 md:m-4 rounded-lg">
      {/* Background Image with transition */}
      <div className="absolute inset-0">
        <Image
          src={currentSlideData.bgImage || "/placeholder.svg"}
          alt="E-learning platform background"
          fill
          className="object-cover transition-opacity duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row p-2 md:p-4">
        {/* Mobile Top Navigation */}
        <div className="lg:hidden flex items-center justify-between p-4 text-white/70 text-sm">
          <span className="truncate">{currentSlideData.industry}</span>
          <div className="flex gap-2 ml-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
              >
                {index === currentSlide && <div className="absolute inset-0 bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="lg:hidden px-4 mb-4">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full w-full">
          {/* Left Side - Previous/Completed Slides */}
          <div className="flex">
            {getPreviousSlides().map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="w-12 xl:w-16 h-full bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white relative transition-all duration-500 hover:bg-slate-800/90 border-r border-white/10"
              >
                <div className="absolute top-6 left-2 xl:left-4">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
                <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium tracking-wide opacity-70">
                  {slide.industry.length > 15 ? slide.industry.substring(0, 12) + "..." : slide.industry}
                </div>
                <div className="absolute bottom-6">
                  <div className="w-3 h-3 rounded-full border border-white/40" />
                </div>
              </button>
            ))}
          </div>

          {/* Center - Main Hero Content */}
          <div className="flex-1 flex flex-col justify-between p-4 xl:p-16 max-w-4xl">
            {/* Main Hero Content */}
            <div className="flex-1 flex items-center">
              <div className="max-w-3xl">
                <h1
                  key={currentSlide}
                  className="text-3xl xl:text-5xl 2xl:text-6xl font-semibold text-white leading-[1.15] mb-4 xl:mb-6 animate-in fade-in slide-in-from-right-4 duration-1000 tracking-tight"
                >
                  {currentSlideData.title}
                </h1>

                <p
                  key={`${currentSlide}-subtitle`}
                  className="text-base xl:text-lg text-gray-200 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-right-4 duration-1000 delay-200"
                >
                  {currentSlideData.subtitle}
                </p>
              </div>
            </div>

            {/* Awards Section */}
            <div className="mt-auto">
              <h3 className="text-white text-base xl:text-lg mb-4 xl:mb-6">Awards</h3>
              <div className="flex gap-3 xl:gap-4">
                <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <div className="w-6 h-6 xl:w-8 xl:h-8 bg-white/30 rounded-full" />
                </div>
                <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <div className="w-6 h-6 xl:w-8 xl:h-8 bg-white/30 rounded-full" />
                </div>
                <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <div className="w-6 h-6 xl:w-8 xl:h-8 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Center-Right - Navigation Area */}
          <div className="w-80 xl:w-96 flex flex-col relative">
            {/* Top Navigation Indicator */}
            <div className="p-4 xl:p-6 flex items-center justify-between text-white/70 text-sm">
              <span className="truncate">{currentSlideData.industry}</span>
              <div className="flex gap-2 ml-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="relative w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                  >
                    {index === currentSlide && <div className="absolute inset-0 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar - Under the dots */}
            <div className="px-4 xl:px-6 mb-4">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="p-4 xl:p-6 flex justify-center gap-3 mt-auto">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Side - Upcoming/Unplayed Slides */}
          <div className="flex">
            {getUpcomingSlides().map((slide, index) => {
              const slideIndex = currentSlide + 1 + index
              return (
                <div key={slide.id}>
                  <button
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-12 xl:w-20 h-full backdrop-blur-sm flex flex-col items-center justify-center text-white relative transition-all duration-500 group border-l border-white/10 ${
                      index === 0
                        ? "bg-slate-700/90 hover:bg-slate-600/95"
                        : index === 1
                          ? "bg-slate-600/90 hover:bg-slate-500/95"
                          : "bg-slate-500/90 hover:bg-slate-400/95"
                    }`}
                  >
                    <div className="absolute top-6 right-2 xl:right-4">
                      <div className="w-2 h-2 rounded-full bg-white/60 group-hover:bg-white/80 transition-colors" />
                    </div>
                    <div className="transform -rotate-90 whitespace-nowrap text-xs xl:text-sm font-medium tracking-wide">
                      {slide.industry.length > 15 ? slide.industry.substring(0, 12) + "..." : slide.industry}
                    </div>
                    <div
                      className="absolute bottom-6 text-white hover:bg-white/20 rounded-full transition-all duration-300 group-hover:scale-110"
                    >
                      <Plus className="h-3 w-3 xl:h-4 xl:w-4" />
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden flex-1 flex flex-col justify-between p-4">
          {/* Main Hero Content */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <h1
                key={currentSlide}
                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-[1.15] mb-4 animate-in fade-in slide-in-from-right-4 duration-1000 tracking-tight"
              >
                {currentSlideData.title}
              </h1>

              <p
                key={`${currentSlide}-subtitle`}
                className="text-base sm:text-lg text-gray-200 leading-relaxed animate-in fade-in slide-in-from-right-4 duration-1000 delay-200"
              >
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex justify-center gap-3 mt-8">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {getUpcomingSlides().map((slide, index) => {
              const slideIndex = currentSlide + 1 + index
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(slideIndex)}
                  className="px-3 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  {slide.industry.length > 10 ? slide.industry.substring(0, 8) + "..." : slide.industry}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
