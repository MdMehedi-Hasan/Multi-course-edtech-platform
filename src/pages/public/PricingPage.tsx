import React from 'react';
import { Check, Sparkles, Building2, GraduationCap, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

interface PricingPageProps {
    onNavigate: (path: string) => void;
}

const plans = [
    {
        name: 'Free Starter',
        price: '$0',
        period: 'forever',
        description: 'Explore free course previews and introductory lesson modules.',
        features: [
            'Access to Free Video Previews',
            'Public Course Catalog Search',
            'Basic Progress Tracking',
            'Community Forum Access',
        ],
        buttonText: 'Get Started Free',
        variant: 'outline' as const,
        icon: GraduationCap,
        iconClasses: 'from-indigo-500 to-violet-600 shadow-indigo-500/25',
    },
    {
        name: 'Student Pro Pass',
        price: '$29',
        period: 'per month',
        description: 'Unlimited access to all courses, curriculums, and certifications.',
        features: [
            'Unlimited Course Enrollments',
            'Interactive Video Player & Bookmarks',
            'Completion Certificates',
            'Direct Instructor Discussions',
            'Downloadable Lesson Resources',
        ],
        buttonText: 'Start Pro Trial',
        variant: 'default' as const,
        popular: true,
        icon: Sparkles,
        iconClasses: 'from-indigo-600 to-violet-600 shadow-indigo-600/30',
    },
    {
        name: 'Enterprise Teams',
        price: '$199',
        period: 'per month',
        description: 'Complete team licensing with Admin governance and analytics.',
        features: [
            'Up to 25 Student Seats',
            'Dedicated Admin Dashboard',
            'Custom Course Publishing',
            'Single Sign-On (SSO) Ready',
            'Priority Technical Support',
        ],
        buttonText: 'Contact Enterprise Sales',
        variant: 'outline' as const,
        icon: Building2,
        iconClasses: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-500/25',
    },
];

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <SEOHead
                title="Simple, Transparent Pricing Plans"
                description="Choose the right EduNexus plan for your learning goals or team organization. Individual courses, monthly passes, and enterprise licensing."
            />

            <PageHero
                eyebrow="Flexible Licensing"
                eyebrowIcon={<Sparkles className="w-4 h-4 text-indigo-400" />}
                title={
                    <>
                        Simple, Transparent{' '}
                        <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </>
                }
                description="Choose the plan that best fits your learning or organizational goals."
            />

            <main className="flex-1 py-10 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative  bg-white rounded-3xl p-8 border shadow-sm flex flex-col justify-between transition-all ${
                                    plan.popular
                                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg shadow-indigo-200/60 lg:-mt-3 lg:mb-3'
                                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/60'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-indigo-600/30">
                                        Most Popular
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <div
                                        className={`w-12 h-12 rounded-2xl bg-linear-to-br ${plan.iconClasses} text-white flex items-center justify-center mb-4 shadow-md`}
                                    >
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg">
                                        {plan.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">
                                        {plan.description}
                                    </p>
                                    <div className="flex items-baseline gap-1.5 mb-6">
                                        <span className="text-4xl font-extrabold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                            {plan.price}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {plan.period}
                                        </span>
                                    </div>

                                    <ul className="space-y-3 text-xs text-slate-600 mb-8">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="flex items-center gap-2.5">
                                                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <Check className="w-3 h-3" />
                                                </span>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    variant={plan.variant}
                                    onClick={() => onNavigate('/register')}
                                    className={`w-full ${
                                        plan.popular
                                            ? 'bg-linear-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700'
                                            : ''
                                    }`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span>
                                All plans include lifetime course access and secure account
                                management.
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
