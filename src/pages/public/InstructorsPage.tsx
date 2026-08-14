import React, { useEffect, useState } from 'react';
import { Star, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Instructor } from '../../types/index';
import { api } from '../../lib/api';
import { SEOHead } from '../../components/ui/SEOHead';

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
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Verified Industry Instructors & Educators"
        description="Learn from accomplished domain experts, experienced practitioners, and senior educators teaching at EduNexus."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Lead Educators</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Learn from World-Class Instructors</h1>
          <p className="text-xs text-slate-500 mt-2">
            Industry veterans and senior educators bringing practical real-world experience directly to your learning journey.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {instructors.map((inst) => (
              <Card
                key={inst.id}
                hoverable
                className="p-6 flex flex-col sm:flex-row gap-6 items-start cursor-pointer border-slate-200/80 hover:border-indigo-300"
                onClick={() => onNavigate(`/instructors/${inst.id}`)}
              >
                <img
                  src={inst.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={inst.name}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{inst.name}</h3>
                    <p className="text-xs font-semibold text-indigo-600 mb-2">{inst.headline}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">{inst.bio}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{inst.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{inst.studentCount.toLocaleString()} Students</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600">
                      <span>{inst.courseCount} Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
