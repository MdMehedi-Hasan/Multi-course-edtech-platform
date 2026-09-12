import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { Category } from '../../types/index';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

interface CategoriesPageProps {
  onNavigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title="Explore Learning Categories & Disciplines"
        description="Explore EduNexus topic categories across Business, Technology, Design, Marketing, Science, and more."
      />

      <PageHero
        eyebrow="Curriculum Domains"
        eyebrowIcon={<Layers className="w-4 h-4 text-indigo-400" />}
        title={
          <>
            Explore{' '}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Learning Categories
            </span>
          </>
        }
        description="Browse structured learning pathways designed to help you master new skills and accelerate your career."
      />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden"
                >
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="h-5 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                  <Skeleton className="h-6 w-24 mt-6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  hoverable
                  className="group p-6 cursor-pointer flex flex-col justify-between border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/60 transition-all"
                  onClick={() => onNavigate(`/courses?category=${cat.id}`)}
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{cat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-600">{cat.courseCount} Courses</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all group-hover:bg-linear-to-r group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/30">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && categories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-slate-500 mb-6">
                Categories are being prepared. Check back soon.
              </p>
              <button
                onClick={() => onNavigate('/courses')}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mx-auto"
              >
                <BookOpen className="w-4 h-4" /> Browse all courses <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};