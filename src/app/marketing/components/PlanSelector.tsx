"use client";

interface Plan {
  id: string;
  title: string;
  description: string;
  script: string;
  coverPrompt: string;
  tags: string[];
  hashtag: string;
}

interface PlanSelectorProps {
  plans: Plan[];
  onSelect: (plan: Plan) => void;
}

export function PlanSelector({ plans, onSelect }: PlanSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">选择营销方案</h3>
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className="w-full text-left p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground mb-1">{plan.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                <div className="flex flex-wrap gap-1">
                  {plan.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="ml-2 text-primary text-sm">选择</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}