import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';

interface PricingPageProps {
  onNavigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      description: 'Explore free course previews and introductory lesson modules.',
      features: ['Access to Free Video Previews', 'Public Course Catalog Search', 'Basic Progress Tracking', 'Community Forum Access'],
      buttonText: 'Get Started Free',
      variant: 'outline' as const,
    },
    {
      name: 'Student Pro Pass',
      price: '$29',
      period: 'per month',
      description: 'Unlimited access to all courses, curriculums, and certifications.',
      features: ['Unlimited Course Enrollments', 'Interactive Video Player & Bookmarks', 'Completion Certificates', 'Direct Instructor Discussions', 'Downloadable Lesson Resources'],
      buttonText: 'Start Pro Trial',
      variant: 'primary' as const,
      popular: true,
    },
    {
      name: 'Enterprise Teams',
      price: '$199',
      period: 'per month',
      description: 'Complete team licensing with Admin governance and analytics.',
      features: ['Up to 25 Student Seats', 'Dedicated Admin Dashboard', 'Custom Course Publishing', 'Single Sign-On (SSO) Ready', 'Priority Technical Support'],
      buttonText: 'Contact Enterprise Sales',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Simple, Transparent Pricing Plans"
        description="Choose the right EduNexus plan for your learning goals or team organization. Individual courses, monthly passes, and enterprise licensing."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Flexible Licensing</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Simple, Transparent Pricing</h1>
          <p className="text-xs text-slate-500 mt-2">Choose the plan that best fits your learning or organizational goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-3xl p-8 border shadow-sm flex flex-col justify-between relative ${
                plan.popular ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.variant}
                size="md"
                onClick={() => onNavigate('/register')}
                className="w-full"
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
