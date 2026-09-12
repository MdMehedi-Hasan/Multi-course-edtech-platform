import React, { useEffect, useState } from 'react';
import { Star, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Instructor } from '../../types/index';
import { api } from '../../lib/api';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

interface InstructorsPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorsPage: React.FC<InstructorsPageProps> = ({ onNavigate }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInstructors() {
      try {
        const data = await api.getInstructors();
        setInstructors(data);
      } catch (err) {
        console.error('Failed to load instructors:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInstructors();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title="Verified Industry Instructors & Educators"
        description="Learn from accomplished domain experts, experienced practitioners, and senior educators teaching at EduNexus."
      />

      <PageHero
        eyebrow="Lead Educators"
        eyebrowIcon={<GraduationCap className="w-4 h-4 text-indigo-400" />}
        title={
          <>
            Learn from{' '}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              World-Class Instructors
            </span>
          </>
        }
        description="Industry veterans and senior educators bringing practical real-world experience directly to your learning journey."
      />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 items-start"
                >
                  <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <div className="pt-3 flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {instructors.map((inst) => (
                <Card
                  key={inst.id}
                  hoverable
                  className="group p-6 flex flex-col sm:flex-row gap-6 items-start cursor-pointer border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/60 transition-all"
                  onClick={() => onNavigate(`/instructors/${inst.id}`)}
                >
                  <img
                    src={
                      inst.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                    }
                    alt={inst.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-200 ring-4 ring-white shadow-md shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{inst.name}</h3>
                      <span className="inline-block text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-0.5 mt-1 mb-2">
                        {inst.headline}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {inst.bio}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{inst.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <GraduationCap className="w-4 h-4" />
                        <span>{inst.studentCount.toLocaleString()} Students</span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600">
                        <span>{inst.courseCount} Courses</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && instructors.length === 0 && (
            <div className="text-center py-16 text-sm text-slate-500">
              Instructors are being onboarded. Check back soon.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};