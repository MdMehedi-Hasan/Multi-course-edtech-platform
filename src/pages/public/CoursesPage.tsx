import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Course, Category } from '../../types/index';
import { api } from '../../lib/api';
import { CourseCard } from '../../components/course/CourseCard';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';

interface CoursesPageProps {
  onNavigate: (path: string) => void;
  initialCategoryId?: string;
  initialSearch?: string;
}

const ITEMS_PER_PAGE = 6;

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate, initialCategoryId, initialSearch }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId || '');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING' | 'POPULAR'>('NEWEST');
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
    search || selectedCategory || selectedLevel || selectedPriceFilter !== 'ALL' || minRating > 0;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <SEOHead
        title="Explore Courses & Masterclasses"
        description="Browse EduNexus' comprehensive course catalog. Filter by category, difficulty level, price, and ratings to find your next course."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Course Directory</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Explore Online Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            High-quality video courses and masterclasses taught by vetted industry experts and educators.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, topic, or keyword..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sort & Quick Selects */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
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
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              >
                <option value="">All Difficulty Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="POPULAR">Sort: Most Popular</option>
                <option value="RATING">Sort: Highest Rated</option>
                <option value="PRICE_LOW">Sort: Price (Low to High)</option>
                <option value="PRICE_HIGH">Sort: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Secondary Filters: Price & Rating Filter */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Price:</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {(['ALL', 'FREE', 'PAID'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedPriceFilter(mode)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                        selectedPriceFilter === mode
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
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
                  className="px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
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
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-900">{filteredCourses.length}</strong> courses
          </span>
          {totalPages > 1 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Course Grid & Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-80 flex flex-col justify-between">
                <div className="bg-slate-200 h-40 rounded-xl w-full mb-4" />
                <div className="bg-slate-200 h-4 rounded w-3/4 mb-2" />
                <div className="bg-slate-200 h-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">No Courses Found</h3>
            <p className="text-xs text-slate-500 mb-6">
              We couldn't find any courses matching your search criteria. Try relaxing your filters or search query.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
              className="gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
