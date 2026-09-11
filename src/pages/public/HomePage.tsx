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
            <section className="bg-slate-900 text-white relative overflow-hidden py-20 lg:py-28 border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 opacity-90" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/90 text-indigo-300 rounded-full border border-indigo-800/80 text-xs font-semibold w-fit">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span>Global Learning Ecosystem</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
                                Learn Anything.{' '}
                                <span className="text-indigo-400">Grow Your Skills.</span> Build
                                Your Future.
                            </h1>

                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                                Explore comprehensive courses taught by world-class educators,
                                industry leaders, and academic experts across business, design,
                                technology, languages, and more.
                            </p>

                            {/* Search Courses Bar */}
                            <form
                                onSubmit={handleHeroSearch}
                                className="flex items-center bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 max-w-xl w-full"
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
                                    variant="default"
                                    className="shrink-0 rounded-xl"
                                >
                                    Search
                                </Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <Button
                                    size="lg"
                                    variant="default"
                                    onClick={() => onNavigate('/courses')}
                                    className="gap-2"
                                >
                                    <span>Explore Course Catalog</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => onNavigate('/register')}
                                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                                >
                                    Join as Student
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-2xl font-extrabold text-white">50K+</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Global Learners
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-white">4.9/5</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Average Rating
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-white">98%</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Positive Outcomes
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Featured Hero Visual / Preview */}
                        <div className="relative lg:block">
                            <div className="bg-slate-800/70 p-6 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
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
                                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/60 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-100">
                                                Structured Video Curriculums
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Section-by-section breakdown with interactive
                                                progress saving
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/60 flex items-center gap-4">
                                        <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-100">
                                                Verifiable Certificates
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Earn credentials validated upon full course
                                                completion
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/60 flex items-center gap-4">
                                        <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-100">
                                                Expert-Led Instruction
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Direct mentorship from vetted educators across
                                                diverse fields
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                                Featured Curriculums
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                                Handpicked Top Courses
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Carefully structured courses for beginner, intermediate, and
                                advanced learners.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('/courses')}
                            className="gap-2"
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
                                      className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-80 flex flex-col justify-between"
                                  >
                                      <div className="bg-slate-200 h-40 rounded-xl w-full mb-4" />
                                      <div className="bg-slate-200 h-4 rounded w-3/4 mb-2" />
                                      <div className="bg-slate-200 h-3 rounded w-1/2" />
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
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                            Learning Domains
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                            Browse by Category
                        </h2>
                        <p className="text-xs text-slate-500 mt-2">
                            Explore diverse disciplines and discover your next learning milestone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Card
                                key={cat.id}
                                hoverable
                                className="p-6 cursor-pointer flex flex-col justify-between border-slate-200/80 hover:border-indigo-300"
                                onClick={() => onNavigate(`/courses?category=${cat.id}`)}
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 shadow-xs">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {cat.description}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                                    <span>{cat.courseCount} Courses</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Courses Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                            Trending Now
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                            Most Popular Among Students
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularCourses.map((course) => (
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
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                                World-Class Educators
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                                Learn From Industry Experts
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Academics, creators, practitioners, and leaders from around the
                                world.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('/instructors')}
                            className="gap-2"
                        >
                            <span>View All Instructors</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topInstructors.map((inst) => (
                            <Card
                                key={inst.id}
                                hoverable
                                className="p-6 text-center cursor-pointer flex flex-col items-center justify-between group"
                                onClick={() => onNavigate(`/instructors/${inst.id}`)}
                            >
                                <div className="flex flex-col items-center">
                                    <img
                                        src={inst.avatarUrl}
                                        alt={inst.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-500 transition-colors mb-4 shadow-sm"
                                    />
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

                                <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-around text-xs text-slate-600 font-medium">
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
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                            Why EduNexus?
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                            Designed for Lifelong Growth
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-800/80 rounded-3xl border border-slate-700/70">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Practical, Real-World Skills
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Gain hands-on competencies through case studies, applied exercises,
                                and actionable course frameworks.
                            </p>
                        </div>

                        <div className="p-8 bg-slate-800/80 rounded-3xl border border-slate-700/70">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Self-Paced & Protected Access
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Learn at your own pace with lifetime enrollment, progress
                                checkpoints, and rich multimedia content.
                            </p>
                        </div>

                        <div className="p-8 bg-slate-800/80 rounded-3xl border border-slate-700/70">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-6">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Global Community</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Connect with thousands of motivated learners, share insights, and
                                expand your personal and professional network.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                            Student Reviews
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                            Loved by Learners Worldwide
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 flex flex-col justify-between border-slate-200">
                            <div>
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                                    "EduNexus helped me accelerate my career in strategic management
                                    and digital marketing. The course depth and practical exercises
                                    were unmatched."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                                    alt="Sarah Jenkins"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
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

                        <Card className="p-6 flex flex-col justify-between border-slate-200">
                            <div>
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                                    "The curriculum structure and video player UX are top notch.
                                    Having direct access to instructor feedback made mastering new
                                    subjects seamless."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                                    alt="Marcus Vance"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
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

                        <Card className="p-6 flex flex-col justify-between border-slate-200">
                            <div>
                                <div className="flex items-center gap-1 text-amber-400 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                                    "As an instructor teaching language fluency, the course creation
                                    dashboard and student engagement tools are exceptionally
                                    intuitive."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                                    alt="David Chen"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
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
            <section className="py-20 bg-indigo-600 text-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Ready to Expand Your Horizons?
                    </h2>
                    <p className="text-indigo-100 text-sm sm:text-base max-w-2xl mx-auto mb-8">
                        Join thousands of learners discovering new passions, building real-world
                        skills, and earning recognized certificates today.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold"
                            onClick={() => onNavigate('/register')}
                        >
                            Create Free Account
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-indigo-400 text-white hover:bg-indigo-700"
                            onClick={() => onNavigate('/pricing')}
                        >
                            Explore Pricing Plans
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};
