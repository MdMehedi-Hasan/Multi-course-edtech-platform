import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';
import { Course, Category } from '@/types/index';
import { api } from '@/lib/api';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEOHead } from '@/components/ui/SEOHead';

interface CoursesPageProps {
    onNavigate: (path: string) => void;
    initialCategoryId?: string;
    initialSearch?: string;
}

const ITEMS_PER_PAGE = 6;

export const CoursesPage: React.FC<CoursesPageProps> = ({
    onNavigate,
    initialCategoryId,
    initialSearch,
}) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters state
    const [search, setSearch] = useState(initialSearch || '');
    const [selectedCategory, setSelectedCategory] = useState(initialCategoryId || '');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<
        'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING' | 'POPULAR'
    >('NEWEST');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function loadCategories() {
            try {
                const catList = await api.getCategories();
                setCategories(catList);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        }
        loadCategories();
    }, []);

    useEffect(() => {
        async function loadCourses() {
            setIsLoading(true);
            try {
                const list = await api.getCourses({
                    search,
                    categoryId: selectedCategory,
                    level: selectedLevel,
                });
                setCourses(list);
            } catch (err) {
                console.error('Failed to load courses:', err);
            } finally {
                setIsLoading(false);
            }
        }
        const timer = setTimeout(loadCourses, 200);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, selectedLevel]);

    // Client-side filtering & sorting
    const filteredCourses = useMemo(() => {
        let result = [...courses];

        // Price Filter
        if (selectedPriceFilter === 'FREE') {
            result = result.filter((c) => c.price === 0);
        } else if (selectedPriceFilter === 'PAID') {
            result = result.filter((c) => c.price > 0);
        }

        // Rating Filter
        if (minRating > 0) {
            result = result.filter((c) => (c.rating || 4.8) >= minRating);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'PRICE_LOW') return a.price - b.price;
            if (sortBy === 'PRICE_HIGH') return b.price - a.price;
            if (sortBy === 'RATING') return (b.rating || 4.8) - (a.rating || 4.8);
            if (sortBy === 'POPULAR') return (b.studentCount || 0) - (a.studentCount || 0);
            // NEWEST default
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return result;
    }, [courses, selectedPriceFilter, minRating, sortBy]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory, selectedLevel, selectedPriceFilter, minRating, sortBy]);

    // Pagination calculation
    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1;
    const paginatedCourses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCourses, currentPage]);

    const handleResetFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedLevel('');
        setSelectedPriceFilter('ALL');
        setMinRating(0);
        setSortBy('NEWEST');
        setCurrentPage(1);
    };

    const hasActiveFilters =
        search ||
        selectedCategory ||
        selectedLevel ||
        selectedPriceFilter !== 'ALL' ||
        minRating > 0;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <SEOHead
                title="Explore Courses & Masterclasses"
                description="Browse EduNexus' comprehensive course catalog. Filter by category, difficulty level, price, and ratings to find your next course."
            />

            {/* Page Header Band */}
            <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.14),transparent_55%)]" />
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse_at_center, black 30%, transparent 75%)',
                    }}
                />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/6 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-semibold w-fit backdrop-blur-md shadow-lg shadow-indigo-500/10">
                        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                        Course Directory
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mt-4 leading-[1.15]">
                        Explore{' '}
                        <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            Online Courses
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl leading-relaxed">
                        High-quality video courses and masterclasses taught by vetted industry
                        experts and educators.
                    </p>
                    <div className="w-16 h-1 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full mt-6" />
                </div>
            </section>

            <main className="flex-1 py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filter Toolbar */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col gap-4 hover:shadow-md hover:shadow-indigo-100/60 transition-shadow">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Search Input */}
                            <div className="relative w-full lg:w-96">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by title, topic, or keyword..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 hover:border-slate-300 transition-colors"
                                />
                            </div>

                            {/* Sort & Quick Selects */}
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-slate-700 font-medium hover:border-slate-300 transition-colors cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-slate-700 font-medium hover:border-slate-300 transition-colors cursor-pointer"
                                >
                                    <option value="">All Difficulty Levels</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>

                                <div className="relative">
                                    <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-slate-700 font-medium hover:border-slate-300 transition-colors cursor-pointer"
                                    >
                                        <option value="NEWEST">Sort: Newest First</option>
                                        <option value="POPULAR">Sort: Most Popular</option>
                                        <option value="RATING">Sort: Highest Rated</option>
                                        <option value="PRICE_LOW">Sort: Price (Low to High)</option>
                                        <option value="PRICE_HIGH">
                                            Sort: Price (High to Low)
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Filters: Price & Rating Filter */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-500">Price:</span>
                                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-1 gap-0.5">
                                        {(['ALL', 'FREE', 'PAID'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setSelectedPriceFilter(mode)}
                                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                                                    selectedPriceFilter === mode
                                                        ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                                }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-500">Rating:</span>
                                    <select
                                        value={minRating}
                                        onChange={(e) => setMinRating(Number(e.target.value))}
                                        className="px-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-slate-700 font-medium hover:border-slate-300 transition-colors cursor-pointer"
                                    >
                                        <option value={0}>All Ratings</option>
                                        <option value={4.5}>4.5★ & above</option>
                                        <option value={4.0}>4.0★ & above</option>
                                    </select>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset All Filters</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Showing{' '}
                            <strong className="text-indigo-600">
                                {filteredCourses.length}
                            </strong>{' '}
                            courses
                        </span>
                        {totalPages > 1 && (
                            <span className="bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </div>

                    {/* Course Grid & Loading Skeletons */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
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
                            ))}
                        </div>
                    ) : paginatedCourses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-lg mx-auto my-8 relative overflow-hidden">
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-100/70 blur-2xl" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base mb-1">
                                    No Courses Found
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    We couldn't find any courses matching your search criteria. Try
                                    relaxing your filters or search query.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-indigo-400 hover:text-indigo-600 rounded-xl"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && totalPages > 1 && (
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-indigo-400 hover:text-indigo-600 rounded-xl"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </Button>

                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-indigo-400 hover:text-indigo-600 rounded-xl"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
