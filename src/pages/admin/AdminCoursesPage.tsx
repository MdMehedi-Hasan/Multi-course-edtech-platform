import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  Archive,
  Trash2,
  Eye,
  Globe,
  Lock,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AdminCoursesPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminCoursesPage: React.FC<AdminCoursesPageProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, publishedFilter, featuredFilter]);

  const fetchCategories = async () => {
    try {
      const cats = await api.getAdminCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminCourses({
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        isPublished: publishedFilter === 'published' ? true : publishedFilter === 'draft' ? false : undefined,
        isFeatured: featuredFilter === 'featured' ? true : undefined,
      });
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch admin courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handlePublishToggle = async (id: string, current: boolean) => {
    try {
      await api.publishAdminCourse(id, !current);
      fetchCourses();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleApproveToggle = async (id: string, current: boolean) => {
    try {
      await api.approveAdminCourse(id, !current);
      fetchCourses();
    } catch (err) {
      console.error('Failed to toggle approve:', err);
    }
  };

  const handleFeatureToggle = async (id: string, current: boolean) => {
    try {
      await api.featureAdminCourse(id, !current);
      fetchCourses();
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    }
  };

  const handleArchiveToggle = async (id: string, current: boolean) => {
    try {
      await api.archiveAdminCourse(id, !current);
      fetchCourses();
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to soft-delete "${title}"?`)) return;
    try {
      await api.deleteAdminCourse(id);
      fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Course Inventory & Quality Governance</h1>
        <p className="text-xs text-slate-400 mt-1">Approve curriculum quality, manage global availability, highlight featured courses, and enforce content policies.</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search course title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-medium text-slate-100 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-medium text-slate-100 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <Button type="submit" variant="default" size="sm">Search</Button>
        </form>
      </Card>

      {/* Courses List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Course & Author</th>
                <th className="px-4 py-3.5">Category & Level</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Enrollments</th>
                <th className="px-4 py-3.5">Flags</th>
                <th className="px-5 py-3.5 text-right">Moderation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading course inventory...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No courses matching criteria.</td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-slate-800 shrink-0 overflow-hidden border border-slate-700">
                          {c.thumbnailUrl ? (
                            <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">COURSE</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 line-clamp-1">{c.title}</p>
                          <p className="text-[11px] text-slate-400">By {c.instructorName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">{c.categoryName}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{c.level}</span>
                    </td>

                    <td className="px-4 py-4 font-extrabold text-purple-400">
                      ${c.price}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-200">
                      {c.studentCount} Students
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {c.isPublished ? (
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Published</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Draft</span>
                        )}

                        {c.isApproved ? (
                          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Approved</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Pending</span>
                        )}

                        {c.isFeatured && (
                          <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-purple-600" /> Featured
                          </span>
                        )}

                        {c.isArchived && (
                          <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">Archived</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublishToggle(c.id, c.isPublished)}
                          title={c.isPublished ? 'Unpublish Course' : 'Publish Course'}
                        >
                          {c.isPublished ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveToggle(c.id, c.isApproved)}
                          title={c.isApproved ? 'Unapprove Course' : 'Approve Course'}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${c.isApproved ? 'text-blue-400' : 'text-slate-400'}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeatureToggle(c.id, c.isFeatured)}
                          title={c.isFeatured ? 'Unfeature Course' : 'Feature Course'}
                        >
                          <Star className={`w-3.5 h-3.5 ${c.isFeatured ? 'fill-purple-600 text-purple-400' : 'text-slate-400'}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchiveToggle(c.id, c.isArchived)}
                          title={c.isArchived ? 'Unarchive' : 'Archive'}
                        >
                          <Archive className={`w-3.5 h-3.5 ${c.isArchived ? 'text-rose-400' : 'text-slate-400'}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          title="Soft Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
