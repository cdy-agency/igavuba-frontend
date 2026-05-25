"use client";

const steps = [
  {
    id: "01",
    title: "Choose Your Course",
    description:
      "Create your account with a few basic details and set up your profile.",
  },
  {
    id: "02",
    title: "Sign Up and Pay",
    description:
      "Browse available programs and pick the course that fits your goals.",
  },
  {
    id: "03",
    title: "Learn and Engage",
    description: "Access lessons, resources, and assessments from any device.",
  },
];

export function WorkflowSection() {
  return (
    <section className="py-5 lg:py-10 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="relative mb-6 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center z-10">
                  <span className="text-white font-bold text-lg">
                    {step.id}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-1/2 w-full px-8 -translate-y-1/2">
                    <div className="border-t-2 border-dotted border-gray-300"></div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
