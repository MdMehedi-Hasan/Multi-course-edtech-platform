import React from 'react';
import { BookOpen, Shield, Sparkles, Award, Users, Globe } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

const pillars = [
    {
        icon: Shield,
        title: 'Role-Based Governance',
        desc: 'Secure access control protecting dedicated portals for Students, Instructors, and Platform Administrators.',
        classes: 'from-indigo-500 to-violet-600 shadow-indigo-500/25',
    },
    {
        icon: Sparkles,
        title: 'Diverse Curriculums',
        desc: 'Courses spanning business, design, technology, science, humanities, marketing, and language fluency.',
        classes: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
    },
    {
        icon: Award,
        title: 'Interactive Progress Engine',
        desc: 'Real-time video progress tracking, completion calculations, and verifiable digital certificates.',
        classes: 'from-amber-500 to-orange-600 shadow-amber-500/25',
    },
    {
        icon: Globe,
        title: 'Global Learner Network',
        desc: 'Join over 50,000 active students and instructors expanding their horizons and leveling up their careers.',
        classes: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-500/25',
    },
];

const stats = [
    { value: '50K+', label: 'Active Learners' },
    { value: '40+', label: 'Expert Instructors' },
    { value: '250+', label: 'Published Courses' },
    { value: '100%', label: 'Verifiable Certificates' },
];

export const AboutPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <SEOHead
                title="About EduNexus Global Learning"
                description="Learn about EduNexus' mission to provide accessible, high-impact education across diverse subjects, empowering lifelong learners worldwide."
            />

            <PageHero
                eyebrow="About EduNexus"
                eyebrowIcon={<BookOpen className="w-4 h-4 text-indigo-400" />}
                title={
                    <>
                        Empowering{' '}
                        <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            Lifelong Learners
                        </span>{' '}
                        Everywhere
                    </>
                }
                description="A modern, multi-purpose online learning ecosystem built for students, educators, and organizations."
            />

            <main className="flex-1 py-10 sm:py-14">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 space-y-8">
                        <div className="text-sm leading-relaxed space-y-4 text-slate-600">
                            <p>
                                EduNexus is a comprehensive online learning platform dedicated to
                                making quality education accessible, engaging, and practical across
                                every discipline.
                            </p>
                            <p>
                                Whether mastering business strategy, graphic design, programming,
                                foreign languages, or creative leadership, our platform connects
                                learners with leading educators through structured video
                                curriculums, interactive assessments, and recognized certificates.
                            </p>
                        </div>

                        {/* Stats Band */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                            {stats.map((s) => (
                                <div key={s.label} className="text-center">
                                    <div className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                        {s.value}
                                    </div>
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Core Pillars */}
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                                What We Stand For
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                                Our Core Pillars
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pillars.map((p) => (
                                <div
                                    key={p.title}
                                    className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-indigo-100/60 hover:border-indigo-300 transition-all"
                                >
                                    <div
                                        className={`w-11 h-11 rounded-2xl bg-linear-to-br ${p.classes} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}
                                    >
                                        <p.icon className="w-5.5 h-5.5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
