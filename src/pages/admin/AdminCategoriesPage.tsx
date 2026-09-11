import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    iconName: 'BookOpen',
    isActive: true,
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        iconName: cat.iconName || 'BookOpen',
        isActive: cat.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        iconName: 'BookOpen',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, formData);
        setFeedback({ type: 'success', message: `Category "${formData.name}" updated successfully.` });
      } else {
        await api.createAdminCategory(formData);
        setFeedback({ type: 'success', message: `Category "${formData.name}" created successfully.` });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save category.' });
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.deleteAdminCategory(id);
      setFeedback({ type: 'success', message: `Category "${name}" deleted.` });
      fetchCategories();
    } catch (err: any) {
      // Handles relationship integrity error message
      setFeedback({ type: 'error', message: err.message || 'Failed to delete category due to data integrity constraints.' });
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    const orders = newCategories.map((c, i) => ({ id: c.id, orderIndex: i }));
    setCategories(newCategories);

    try {
      await api.reorderAdminCategories(orders);
    } catch (err) {
      console.error('Failed to reorder categories:', err);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Taxonomy & Category Management</h1>
          <p className="text-xs text-slate-500 mt-1">Organize course taxonomy, manage custom tags, reorder hierarchy, and safeguard relationship data integrity.</p>
        </div>
        <Button variant="default" size="sm" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Category
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-slate-200/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">Order</th>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5">Associated Courses</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No categories found.</td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleReorder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorder(idx, 'down')}
                          disabled={idx === categories.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{c.description || 'No description provided.'}</div>
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px] text-purple-700 font-bold">{c.slug}</td>

                    <td className="px-4 py-4 font-bold text-slate-800">
                      {c.courseCount} Courses
                    </td>

                    <td className="px-4 py-4">
                      {c.isActive ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">Disabled</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(c)}>
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(c.id, c.name)}>
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
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

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Machine Learning & AI"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="machine-learning-ai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of topics in this category..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="font-bold text-slate-800">
                  Active (Visible in course filters)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
