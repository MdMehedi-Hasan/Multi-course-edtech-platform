import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Category, CourseLevel } from '../../types/index';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface CreateCoursePageProps {
  onNavigate: (path: string) => void;
}

export const CreateCoursePage: React.FC<CreateCoursePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(49.99);
  const [level, setLevel] = useState<CourseLevel>('BEGINNER');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription || !description || !categoryId) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createCourse({
        title,
        shortDescription,
        description,
        price: Number(price),
        level,
        categoryId,
      });

      showToast('Course Created!', `Course "${title}" has been published to the catalog.`, 'success');
      onNavigate('/instructor/courses');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create course.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create New Course Curriculum</h1>
        <p className="text-xs text-slate-500 mt-1">Publish a new engineering course with default video modules.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <Input
          label="Course Title"
          placeholder="e.g., Enterprise Microservices Architecture"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Short Summary"
          placeholder="Brief 1-2 sentence overview for course cards"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Syllabus Description</label>
          <textarea
            rows={4}
            placeholder="Detailed course objectives and prerequisites..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Price ($ USD)"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Difficulty Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Domain Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
          Publish Course
        </Button>
      </form>
    </div>
  );
};
