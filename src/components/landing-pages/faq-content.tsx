"use client";

import {
  AccordionContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "What is IGA-VUBA Health e-learning platform?",
    answer:
      "IGA-VUBA Health is a comprehensive e-learning platform designed for healthcare professionals, students, and institutions. We offer CPD-certified courses, digital health training, and specialized healthcare education modules that can be accessed remotely from anywhere.",
  },
  {
    question: "Are the courses certified and recognized?",
    answer:
      "Yes, all our courses are CPD (Continuing Professional Development) certified and recognized by relevant healthcare professional bodies. Upon successful completion, you will receive a certificate that can be used for professional development credits.",
  },
  {
    question: "Can I access courses on mobile devices?",
    answer:
      "Absolutely! Our platform is fully responsive and optimized for mobile devices, tablets, and desktops. You can access your courses, watch lectures, complete assessments, and track your progress from any device.",
  },
  {
    question: "How do I enroll in a course?",
    answer:
      "Enrolling is simple! Browse our course catalog, select the course you're interested in, and click \"Enroll Now\". For free courses, you'll have immediate access. For members-only courses, you may need to create an account.",
  },
  {
    question: "What happens if I need help during my course?",
    answer:
      "We provide comprehensive support through multiple channels. You can access course forums to interact with instructors and fellow learners, contact our support team via email or chat, and participate in scheduled Q&A sessions.",
  },
  {
    question: "How long do I have access to enrolled courses?",
    answer:
      "Once enrolled, you have lifetime access to your course materials, including video lectures, downloadable resources, and course updates. This allows you to learn at your own pace and revisit content whenever you need.",
  },
];

export function FAQContent() {
  return (
    <>
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto">
          Answers to your most common questions. Quick, clear, and helpful
          information to get you started.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="mx-auto max-w-4xl">
        <div className="bg-card/80 dark:bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl shadow-muted-foreground/10 dark:shadow-none overflow-hidden">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="w-full"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border/50 last:border-b-0 px-6 md:px-8"
              >
                <AccordionTrigger className="text-left py-6 md:py-8 text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 md:pb-8 text-muted-foreground leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}
