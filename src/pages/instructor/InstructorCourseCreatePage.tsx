import React, { useEffect, useState } from 'react';
import { ArrowLeft, PlusCircle, ShieldAlert, Image, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorCourseCreatePageProps {
  onNavigate: (path: string) => void;
}

export const InstructorCourseCreatePage: React.FC<InstructorCourseCreatePageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [price, setPrice] = useState<number>(49.99);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        setCategories(res);
        if (res.length > 0) {
          setCategoryId(res[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCats(false);
      }
    }
    loadCats();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !categoryId) {
      setErrorMsg('Please fill out all required fields (title, short description, and category).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const course = await api.createInstructorCourse({
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim(),
        categoryId,
        level,
        price: Number(price) || 0,
        thumbnailUrl: thumbnailUrl.trim(),
      });

      // Navigate to course edit page to start section/lesson building
      onNavigate(`/instructor/courses/${course.id}/edit`);
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setErrorMsg(err.message || 'Failed to create course draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('/instructor/courses')}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
          </button>
          <h1 className="text-2xl font-black text-slate-900">Create New Course Draft</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide the initial details for your course. You can add sections and lessons on the next screen.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Course Form */}
      <Card className="p-6 border-slate-200 space-y-6">
        <form onSubmit={handleCreateCourse} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Strategic Business Leadership & Decision Making"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Description (Subtitle) *
            </label>
            <input
              type="text"
              required
              placeholder="Brief 1-2 sentence summary of what students will learn..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description & Curriculum Overview
            </label>
            <textarea
              rows={5}
              placeholder="Describe the target audience, prerequisites, learning outcomes, and key concepts covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Thumbnail Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {thumbnailUrl && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Thumbnail Preview</span>
              <div className="w-48 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
             
              onClick={() => onNavigate('/instructor/courses')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
             
              disabled={isSubmitting}
              className="text-xs gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Draft...' : 'Create Course Draft'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
