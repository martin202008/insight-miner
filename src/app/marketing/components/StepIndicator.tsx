"use client";

interface Step {
  number: number;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: "主题输入" },
  { number: 2, label: "营销方案" },
  { number: 3, label: "视频制作" },
  { number: 4, label: "发布" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
              currentStep > step.number
                ? "bg-primary text-primary-foreground"
                : currentStep === step.number
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > step.number ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.number
            )}
          </div>
          <span
            className={`ml-2 text-sm font-medium hidden sm:inline ${
              currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 mx-2 ${
                currentStep > step.number ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}