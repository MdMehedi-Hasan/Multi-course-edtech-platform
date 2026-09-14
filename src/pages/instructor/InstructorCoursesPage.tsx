import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Trash2, FileEdit, CheckCircle2, ShieldAlert, Eye, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setIsLoading(true);
      const res = await api.getInstructorCourses();
      setCourses(res);
    } catch (err) {
      console.error('Failed to load instructor courses:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setErrorMsg(null);
      await api.deleteInstructorCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      setErrorMsg(err.message || 'Failed to delete course.');
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      setErrorMsg(null);
      const updated = await api.publishInstructorCourse(courseId, !currentStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isPublished: updated.isPublished } : c))
      );
    } catch (err: any) {
      console.error('Failed to publish/unpublish course:', err);
      setErrorMsg(err.message || 'Failed to update publication status. Ensure all course requirements are met.');
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (filter === 'PUBLISHED' && !c.isPublished) return false;
    if (filter === 'DRAFT' && c.isPublished) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.shortDescription?.toLowerCase().includes(q);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500/40"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/50">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Course Management Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, draft, structure curriculum sections, and manage publishing states for your courses.
          </p>
        </div>

        <Button
          variant="default"
         
          onClick={() => onNavigate('/instructor/courses/create')}
          className="gap-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-700/60 p-1 rounded-xl">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'ALL' ? 'bg-slate-900/60 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter('PUBLISHED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'PUBLISHED' ? 'bg-slate-900/60 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Published ({courses.filter((c) => c.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'DRAFT' ? 'bg-slate-900/60 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drafts ({courses.filter((c) => !c.isPublished).length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 text-slate-100 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center border-slate-700/50">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-200">No courses match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Create a new course to start building your teaching catalog.</p>
          <Button
            variant="default"
            size="sm"
            onClick={() => onNavigate('/instructor/courses/create')}
            className="mt-4 text-xs"
          >
            Create New Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <Card key={c.id} className="p-6 flex flex-col justify-between border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="space-y-3">
                <div className="aspect-video bg-slate-700/60 rounded-xl overflow-hidden border border-slate-700/50 relative">
                  {c.thumbnailUrl ? (
                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                      No Thumbnail
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs ${
                      c.isPublished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {c.categoryName || 'General'}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1.5 line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.shortDescription}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-2 border-t border-slate-700/50">
                  <span>{c.sectionCount || 0} Sections · {c.lessonCount || 0} Lessons</span>
                  <span className="font-extrabold text-slate-100">${c.price}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onNavigate(`/instructor/courses/${c.id}/edit`)}
                    className="text-xs gap-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(c.id, c.isPublished)}
                    className="text-xs"
                  >
                    {c.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>

                <button
                  onClick={() => handleDeleteCourse(c.id, c.title)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
