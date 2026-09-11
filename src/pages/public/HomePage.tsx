import React, { useEffect, useState } from 'react';
import {
    BookOpen,
    Shield,
    GraduationCap,
    Award,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    TrendingUp,
    Users,
    Search,
    Star,
    Zap,
    Globe,
    MessageSquareQuote,
    Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEOHead } from '@/components/ui/SEOHead';
import { CourseCard } from '@/components/course/CourseCard';
import { Course, Category, Instructor } from '@/types/index';

interface HomePageProps {
    onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
    const [popularCourses, setPopularCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [topInstructors, setTopInstructors] = useState<Instructor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [cList, catList, instList] = await Promise.all([
                    api.getCourses(),
                    api.getCategories(),
                    api.getInstructors().catch(() => []),
                ]);

                setFeaturedCourses(cList.slice(0, 3));
                setPopularCourses(cList.slice(0, 4));
                setCategories(catList);
                setTopInstructors(instList.slice(0, 4));
            } catch (err) {
                console.error('Failed to load homepage data:', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const handleHeroSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onNavigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            onNavigate('/courses');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <SEOHead
                title="Learn Anything. Grow Your Skills. Build Your Future."
                description="EduNexus is the premier global online learning ecosystem. Discover expert-led courses across business, technology, design, languages, marketing, and leadership."
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-28 border-b border-slate-800">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.28),transparent_55%)] " />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.18),transparent_55%)] " />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_45%)] " />
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 items-center">
                        <div className="flex flex-col gap-7">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/6 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-semibold w-fit backdrop-blur-md shadow-lg shadow-indigo-500/10">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span>Global Learning Ecosystem</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
                                Learn Anything.{' '}
                                <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    Grow Your Skills.
                                </span>{' '}
                                Build Your Future.
                            </h1>

                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                                Explore comprehensive courses taught by world-class educators,
                                industry leaders, and academic experts across business, design,
                                technology, languages, and more.
                            </p>

                            {/* Search Courses Bar */}
                            <form
                                onSubmit={handleHeroSearch}
                                className="flex items-center bg-white/[0.07] backdrop-blur-md p-2 rounded-2xl border border-white/10 max-w-xl w-full shadow-2xl shadow-black/20 focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all"
                            >
                                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="What do you want to learn today? (e.g., Marketing, Design, Spanish, Management)"
                                    className="w-full bg-transparent border-none px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
                                />
                                <Button
                                    type="submit"
                                    className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                                >
                                    Search
                                </Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <Button
                                    size="lg"
                                    onClick={() => onNavigate('/courses')}
                                    className="gap-2 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 rounded-xl"
                                >
                                    <span>Explore Course Catalog</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => onNavigate('/register')}
                                    className="border-white/15 text-slate-100 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-md"
                                >
                                    Join as Student
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-white/4 border border-white/10 px-4 py-3 backdrop-blur-md">
                                    <p className="text-2xl font-extrabold text-transparent bg-linear-to-r from-white to-indigo-300 bg-clip-text">
                                        50K+
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        Global Learners
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/4 border border-white/10 px-4 py-3 backdrop-blur-md">
                                    <p className="text-2xl font-extrabold text-transparent bg-linear-to-r from-white to-indigo-300 bg-clip-text">
                                        4.9/5
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        Average Rating
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/4 border border-white/10 px-4 py-3 backdrop-blur-md">
                                    <p className="text-2xl font-extrabold text-transparent bg-linear-to-r from-white to-indigo-300 bg-clip-text">
                                        98%
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        Positive Outcomes
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Featured Hero Visual / Preview */}
                        <div className="relative lg:block">
                            {/* Glow behind visual */}
                            <div className="absolute -inset-6 bg-linear-to-tr from-indigo-600/30 via-violet-600/20 to-fuchsia-600/20 blur-2xl rounded-[2.5rem] pointer-events-none" />

                            <div className="relative bg-white/5 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
                                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-xs font-mono text-indigo-300 font-bold">
                                        EduNexus Learning Suite
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex items-center gap-4 backdrop-blur-md hover:border-indigo-500/40 hover:bg-slate-900 transition-colors">
                                        <div className="p-3 bg-linear-to-br from-indigo-500/40 to-violet-500/40 text-indigo-300 rounded-xl shadow-lg shadow-indigo-500/20">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">
                                                Structured Video Curriculums
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Section-by-section breakdown with interactive
                                                progress saving
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                                    </div>

                                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex items-center gap-4 backdrop-blur-md hover:border-emerald-500/40 hover:bg-slate-900 transition-colors">
                                        <div className="p-3 bg-linear-to-br from-emerald-500/40 to-teal-500/40 text-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">
                                                Verifiable Certificates
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Earn credentials validated upon full course
                                                completion
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                                    </div>

                                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 flex items-center gap-4 backdrop-blur-md hover:border-amber-500/40 hover:bg-slate-900 transition-colors">
                                        <div className="p-3 bg-linear-to-br from-amber-500/40 to-orange-500/40 text-amber-300 rounded-xl shadow-lg shadow-amber-500/20">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">
                                                Expert-Led Instruction
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Direct mentorship from vetted educators across
                                                diverse fields
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating pill */}
                            <div className="absolute -bottom-5 -left-4 hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-2.5 shadow-2xl">
                                <div className="p-1.5 bg-indigo-500/30 rounded-lg">
                                    <Clock className="w-4 h-4 text-indigo-300" />
                                </div>
                                <span className="text-xs font-bold text-white">
                                    Lifetime Course Access
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                Featured Curriculums
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                                Handpicked Top Courses
                            </h2>
                            <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
                                Carefully structured courses for beginner, intermediate, and
                                advanced learners.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('/courses')}
                            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-indigo-400 hover:text-indigo-600 rounded-xl"
                        >
                            <span>View All Courses</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                      key={i}
                                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                                  >
                                      <Skeleton className="aspect-video w-full rounded-none" />
                                      <div className="p-5 space-y-3">
                                          <div className="flex items-center justify-between">
                                              <Skeleton className="h-4 w-16" />
                                              <Skeleton className="h-4 w-24" />
                                          </div>
                                          <Skeleton className="h-5 w-3/4" />
                                          <Skeleton className="h-4 w-full" />
                                          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                                              <Skeleton className="h-6 w-24" />
                                              <Skeleton className="h-6 w-14" />
                                          </div>
                                      </div>
                                  </div>
                              ))
                            : featuredCourses.map((course) => (
                                  <CourseCard
                                      key={course.id}
                                      course={course}
                                      onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)}
                                  />
                              ))}
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-20 bg-white border-t border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Learning Domains
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            Browse by Category
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">
                            Explore diverse disciplines and discover your next learning milestone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <div
                                      key={i}
                                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                                  >
                                      <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
                                      <Skeleton className="h-5 w-2/3 mb-2" />
                                      <Skeleton className="h-4 w-full mb-1" />
                                      <Skeleton className="h-4 w-3/4" />
                                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                          <Skeleton className="h-4 w-16" />
                                          <Skeleton className="w-7 h-7 rounded-full" />
                                      </div>
                                  </div>
                              ))
                            : categories.map((cat) => (
                            <Card
                                key={cat.id}
                                hoverable
                                className="p-6 cursor-pointer flex flex-col justify-between border-slate-200/80 hover:border-indigo-300 group relative overflow-hidden"
                                onClick={() => onNavigate(`/courses?category=${cat.id}`)}
                            >
                                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-indigo-50 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-violet-50 text-indigo-600 flex items-center justify-center font-bold mb-4 shadow-sm border border-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {cat.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold relative">
                                    <span>{cat.courseCount} Courses</span>
                                    <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Courses Section */}
            <section className="py-20 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Trending Now
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 flex items-center justify-center gap-3">
                            <TrendingUp className="w-7 h-7 text-indigo-600" />
                            Most Popular Among Students
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <div
                                      key={i}
                                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                                  >
                                      <Skeleton className="aspect-video w-full rounded-none" />
                                      <div className="p-5 space-y-3">
                                          <Skeleton className="h-4 w-16" />
                                          <Skeleton className="h-5 w-4/5" />
                                          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                              <Skeleton className="h-6 w-24" />
                                              <Skeleton className="h-6 w-14" />
                                          </div>
                                      </div>
                                  </div>
                              ))
                            : popularCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Instructors */}
            <section className="py-20 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                World-Class Educators
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                                Learn From Industry Experts
                            </h2>
                            <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
                                Academics, creators, practitioners, and leaders from around the
                                world.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('/instructors')}
                            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-indigo-400 hover:text-indigo-600 rounded-xl"
                        >
                            <span>View All Instructors</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <div
                                      key={i}
                                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center"
                                  >
                                      <div className="relative mb-5">
                                          <Skeleton className="w-20 h-20 rounded-full" />
                                      </div>
                                      <Skeleton className="h-5 w-28 mb-2" />
                                      <Skeleton className="h-3.5 w-20 mb-3" />
                                      <Skeleton className="h-4 w-full mb-1" />
                                      <Skeleton className="h-4 w-3/4 mb-1" />
                                      <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-around">
                                          <Skeleton className="h-8 w-10" />
                                          <Skeleton className="h-8 w-10" />
                                          <Skeleton className="h-8 w-10" />
                                      </div>
                                  </div>
                              ))
                            : topInstructors.map((inst) => (
                            <Card
                                key={inst.id}
                                hoverable
                                className="p-6 text-center cursor-pointer flex flex-col items-center justify-between group overflow-hidden relative"
                                onClick={() => onNavigate(`/instructors/${inst.id}`)}
                            >
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-linear-to-br from-indigo-100/80 to-violet-100/80 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center relative">
                                    <div className="relative mb-5">
                                        <div className="absolute -inset-1.5 rounded-full bg-linear-to-r from-indigo-400 to-violet-400 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all blur-sm" />
                                        <img
                                            src={inst.avatarUrl}
                                            alt={inst.name}
                                            className="relative w-20 h-20 rounded-full object-cover border-2 border-white shadow-md group-hover:border-indigo-400 transition-colors"
                                        />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                                        {inst.name}
                                    </h3>
                                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                                        {inst.headline}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                        {inst.bio}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-around text-xs text-slate-600 font-medium relative">
                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm">
                                            {inst.courseCount}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Courses</span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200" />
                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm">
                                            {inst.studentCount.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Students</span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200" />
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        <span>{inst.rating}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Benefits */}
            <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_50%)] " />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.12),transparent_50%)] " />
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse_at_center, black 20%, transparent 70%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse_at_center, black 20%, transparent 70%)',
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Why EduNexus?
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                            Designed for Lifelong Growth
                        </h2>
                        <div className="w-16 h-1 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full mx-auto mt-5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative p-8 bg-white/4 rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden group hover:border-indigo-500/40 hover:bg-white/6 transition-all">
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500/30 to-violet-500/30 text-indigo-300 flex items-center justify-center mb-6 border border-indigo-400/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Practical, Real-World Skills
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Gain hands-on competencies through case studies, applied
                                    exercises, and actionable course frameworks.
                                </p>
                            </div>
                        </div>

                        <div className="relative p-8 bg-white/4 rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden group hover:border-emerald-500/40 hover:bg-white/6 transition-all">
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Self-Paced & Protected Access
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Learn at your own pace with lifetime enrollment, progress
                                    checkpoints, and rich multimedia content.
                                </p>
                            </div>
                        </div>

                        <div className="relative p-8 bg-white/4 rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden group hover:border-amber-500/40 hover:bg-white/6 transition-all">
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500/30 to-orange-500/30 text-amber-300 flex items-center justify-center mb-6 border border-amber-400/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Global Community
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Connect with thousands of motivated learners, share insights,
                                    and expand your personal and professional network.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Student Reviews
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            Loved by Learners Worldwide
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 flex flex-col justify-between border-slate-200 relative overflow-hidden group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all">
                            <MessageSquareQuote className="absolute -top-2 -right-2 w-16 h-16 text-indigo-50 group-hover:text-indigo-100 transition-colors" />
                            <div className="relative">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 italic leading-relaxed mb-6">
                                    "EduNexus helped me accelerate my career in strategic management
                                    and digital marketing. The course depth and practical exercises
                                    were unmatched."
                                </p>
                            </div>
                            <div className="relative flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div className="p-0.5 rounded-full bg-linear-to-r from-indigo-500 to-violet-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                                        alt="Sarah Jenkins"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-xs">
                                        Sarah Jenkins
                                    </h4>
                                    <p className="text-[11px] text-slate-500">
                                        Marketing Lead at GlobalBrand
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 flex flex-col justify-between border-slate-200 relative overflow-hidden group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all">
                            <MessageSquareQuote className="absolute -top-2 -right-2 w-16 h-16 text-indigo-50 group-hover:text-indigo-100 transition-colors" />
                            <div className="relative">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 italic leading-relaxed mb-6">
                                    "The curriculum structure and video player UX are top notch.
                                    Having direct access to instructor feedback made mastering new
                                    subjects seamless."
                                </p>
                            </div>
                            <div className="relative flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div className="p-0.5 rounded-full bg-linear-to-r from-indigo-500 to-violet-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                                        alt="Marcus Vance"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-xs">
                                        Marcus Vance
                                    </h4>
                                    <p className="text-[11px] text-slate-500">
                                        Creative Director & Educator
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 flex flex-col justify-between border-slate-200 relative overflow-hidden group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all">
                            <MessageSquareQuote className="absolute -top-2 -right-2 w-16 h-16 text-indigo-50 group-hover:text-indigo-100 transition-colors" />
                            <div className="relative">
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 italic leading-relaxed mb-6">
                                    "As an instructor teaching language fluency, the course creation
                                    dashboard and student engagement tools are exceptionally
                                    intuitive."
                                </p>
                            </div>
                            <div className="relative flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div className="p-0.5 rounded-full bg-linear-to-r from-indigo-500 to-violet-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                                        alt="David Chen"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-xs">David Chen</h4>
                                    <p className="text-[11px] text-slate-500">
                                        Language & Cultural Educator
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white px-6 py-16 sm:px-16 text-center shadow-2xl shadow-indigo-600/30">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.35),transparent_55%)]" />
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)',
                                backgroundSize: '48px 48px',
                            }}
                        />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/25 rounded-full text-xs font-semibold backdrop-blur-md mb-6">
                                <Sparkles className="w-4 h-4" />
                                Start Your Learning Journey
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                                Ready to Expand Your Horizons?
                            </h2>
                            <p className="text-indigo-100 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                                Join thousands of learners discovering new passions, building
                                real-world skills, and earning recognized certificates today.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-xl shadow-indigo-900/30 rounded-xl"
                                    onClick={() => onNavigate('/register')}
                                >
                                    Create Free Account
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/40 text-white hover:bg-white/10 bg-white/5 backdrop-blur-md rounded-xl"
                                    onClick={() => onNavigate('/pricing')}
                                >
                                    Explore Pricing Plans
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
