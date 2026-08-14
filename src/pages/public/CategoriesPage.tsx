import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { Category } from '../../types/index';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { SEOHead } from '../../components/ui/SEOHead';

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
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Explore Learning Categories & Disciplines"
        description="Explore EduNexus topic categories across Business, Technology, Design, Marketing, Science, and more."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Curriculum Domains</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Explore Learning Categories</h1>
          <p className="text-xs text-slate-500 mt-2">
            Browse structured learning pathways designed to help you master new skills and accelerate your career.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                hoverable
                className="p-6 cursor-pointer flex flex-col justify-between border-slate-200/80 hover:border-indigo-300"
                onClick={() => onNavigate(`/courses?category=${cat.id}`)}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{cat.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                  <span>{cat.courseCount} Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
