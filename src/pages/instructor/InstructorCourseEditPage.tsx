import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Video,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorCourseEditPageProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export const InstructorCourseEditPage: React.FC<InstructorCourseEditPageProps> = ({ courseId, onNavigate }) => {
  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CURRICULUM'>('CURRICULUM');

  // Form State for Details
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<string>('BEGINNER');
  const [price, setPrice] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Section Modal / New Section State
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Lesson Modal / New Lesson State
  const [activeSectionIdForLesson, setActiveSectionIdForLesson] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    durationMinutes: 10,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    content: '',
    downloadableUrl: '',
    externalUrl: '',
    isFreePreview: false,
  });

  // Edit Lesson State
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [c, cats] = await Promise.all([
        api.getInstructorCourseDetail(courseId),
        api.getCategories(),
      ]);

      setCourse(c);
      setCategories(cats);

      // Populate Meta Form
      setTitle(c.title || '');
      setShortDescription(c.shortDescription || '');
      setDescription(c.description || '');
      setCategoryId(c.categoryId || (cats[0]?.id || ''));
      setLevel(c.level || 'BEGINNER');
      setPrice(c.price || 0);
      setThumbnailUrl(c.thumbnailUrl || '');
      setValidationErrors(c.validationErrors || []);
    } catch (err: any) {
      console.error('Failed to load course details:', err);
      setErrorMsg(err.message || 'Unauthorized: You do not have permission to edit this course.');
    } finally {
      setIsLoading(false);
    }
  }

  // Save Meta Details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await api.updateInstructorCourse(courseId, {
        title,
        shortDescription,
        description,
        categoryId,
        level,
        price,
        thumbnailUrl,
      });

      setSuccessMsg('Course settings saved.');
      await loadData();
    } catch (err: any) {
      console.error('Failed to update course details:', err);
      setErrorMsg(err.message || 'Failed to update course.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const targetStatus = !course.isPublished;
      const result = await api.publishInstructorCourse(courseId, targetStatus);

      setSuccessMsg(
        targetStatus
          ? 'Course published successfully to public catalog!'
          : 'Course unpublished and saved as draft.'
      );
      await loadData();
    } catch (err: any) {
      console.error('Failed to publish course:', err);
      setErrorMsg(err.message || 'Cannot publish course until validation criteria are satisfied.');
      if (err.errors) setValidationErrors(err.errors);
    } finally {
      setIsSaving(false);
    }
  };

  // Section Handlers
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    try {
      setErrorMsg(null);
      await api.addCourseSection(courseId, newSectionTitle.trim());
      setNewSectionTitle('');
      setIsAddingSection(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to add section:', err);
      setErrorMsg(err.message || 'Failed to add section.');
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    if (!window.confirm(`Delete section "${sectionTitle}" and all its lessons?`)) return;

    try {
      setErrorMsg(null);
      await api.deleteCourseSection(courseId, sectionId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete section:', err);
      setErrorMsg(err.message || 'Failed to delete section.');
    }
  };

  const handleMoveSection = async (sectionIndex: number, direction: 'UP' | 'DOWN') => {
    const sections = [...course.sections];
    const targetIndex = direction === 'UP' ? sectionIndex - 1 : sectionIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap orderIndex
    const temp = sections[sectionIndex];
    sections[sectionIndex] = sections[targetIndex];
    sections[targetIndex] = temp;

    const sectionOrders = sections.map((s, idx) => ({ id: s.id, orderIndex: idx }));

    try {
      await api.reorderCourseSections(courseId, sectionOrders);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reorder sections:', err);
    }
  };

  // Lesson Handlers
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionIdForLesson || !lessonForm.title.trim()) return;

    try {
      setErrorMsg(null);
      await api.addCourseLesson(courseId, activeSectionIdForLesson, lessonForm);
      setActiveSectionIdForLesson(null);
      setLessonForm({
        title: '',
        durationMinutes: 10,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: '',
        downloadableUrl: '',
        externalUrl: '',
        isFreePreview: false,
      });
      await loadData();
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      setErrorMsg(err.message || 'Failed to create lesson.');
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      setErrorMsg(null);
      await api.updateCourseLesson(courseId, editingLesson.id, editingLesson);
      setEditingLesson(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to update lesson:', err);
      setErrorMsg(err.message || 'Failed to update lesson.');
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!window.confirm(`Delete lesson "${lessonTitle}"?`)) return;

    try {
      setErrorMsg(null);
      await api.deleteCourseLesson(courseId, lessonId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete lesson:', err);
      setErrorMsg(err.message || 'Failed to delete lesson.');
    }
  };

  const handleMoveLesson = async (sectionId: string, lessonIndex: number, direction: 'UP' | 'DOWN') => {
    const section = course.sections.find((s: any) => s.id === sectionId);
    if (!section) return;

    const lessons = [...section.lessons];
    const targetIndex = direction === 'UP' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[targetIndex];
    lessons[targetIndex] = temp;

    const lessonOrders = lessons.map((l, idx) => ({ id: l.id, orderIndex: idx }));

    try {
      await api.reorderCourseLessons(courseId, sectionId, lessonOrders);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reorder lessons:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-12 text-center text-rose-600 border-rose-200">
        <ShieldAlert className="w-12 h-12 mx-auto mb-2" />
        <h3 className="font-bold text-base">Course Not Found or Access Denied</h3>
        <p className="text-xs text-slate-500 mt-1">
          You do not have permission to edit this course or it has been removed.
        </p>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/instructor/courses')} className="mt-4">
          Return to Courses
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Status Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('/instructor/courses')}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Directory
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 line-clamp-1">{course.title}</h1>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                course.isPublished
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(`/courses/${course.id}`)}
            className="text-xs gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Preview</span>
          </Button>

          <Button
            variant={course.isPublished ? 'outline' : 'primary'}
            size="sm"
            onClick={handleTogglePublish}
            disabled={isSaving}
            className={`text-xs gap-1.5 ${
              !course.isPublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{course.isPublished ? 'Unpublish Course' : 'Publish Course'}</span>
          </Button>
        </div>
      </div>

      {/* Validation Banner if Errors Exist */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Publishing Checklist ({validationErrors.length} requirement missing)</span>
          </div>
          <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 pl-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('CURRICULUM')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'CURRICULUM'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Course Curriculum & Lessons</span>
        </button>

        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'DETAILS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Course Settings & Pricing</span>
        </button>
      </div>

      {/* TAB 1: CURRICULUM BUILDER */}
      {activeTab === 'CURRICULUM' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Sections & Lessons Builder</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingSection(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Section</span>
            </Button>
          </div>

          {/* Add Section Inline Form */}
          {isAddingSection && (
            <Card className="p-4 border-indigo-200 bg-indigo-50/40 space-y-3">
              <h3 className="text-xs font-bold text-indigo-950">Add New Section</h3>
              <form onSubmit={handleAddSection} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g., Section 2: Core Principles & Methodology"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 bg-white text-slate-900 p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Save Section
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingSection(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </form>
            </Card>
          )}

          {/* Sections List */}
          {course.sections?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500 border-slate-200">
              No sections created yet. Click "Add New Section" to start building your course modules.
            </Card>
          ) : (
            <div className="space-y-6">
              {course.sections.map((section: any, sIdx: number) => (
                <Card key={section.id} className="p-5 border-slate-200 space-y-4 bg-white">
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        #{sIdx + 1}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm">{section.title}</h3>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({section.lessons?.length || 0} lessons)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSection(sIdx, 'UP')}
                        disabled={sIdx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                        title="Move Section Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(sIdx, 'DOWN')}
                        disabled={sIdx === course.sections.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                        title="Move Section Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id, section.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-2"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List in Section */}
                  <div className="space-y-2 pl-2">
                    {section.lessons?.map((lesson: any, lIdx: number) => (
                      <div
                        key={lesson.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between text-xs gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {lIdx + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {lesson.durationMinutes} mins
                              </span>
                              {lesson.isFreePreview && (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  Free Preview
                                </span>
                              )}
                              {lesson.downloadableUrl && (
                                <span className="flex items-center gap-0.5 text-indigo-600">
                                  <Download className="w-3 h-3" /> Attachment
                                </span>
                              )}
                              {lesson.externalUrl && (
                                <span className="flex items-center gap-0.5 text-cyan-600">
                                  <ExternalLink className="w-3 h-3" /> Link
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleMoveLesson(section.id, lIdx, 'UP')}
                            disabled={lIdx === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveLesson(section.id, lIdx, 'DOWN')}
                            disabled={lIdx === section.lessons.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLesson(lesson)}
                            className="text-[10px] py-1 px-2 h-auto"
                          >
                            Edit
                          </Button>

                          <button
                            onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSectionIdForLesson(section.id)}
                      className="text-xs text-indigo-600 hover:bg-indigo-50 mt-2 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Lesson to Section
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETAILS FORM */}
      {activeTab === 'DETAILS' && (
        <Card className="p-6 border-slate-200 space-y-6">
          <form onSubmit={handleSaveDetails} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Description (Subtitle)
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Course Overview
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
                  onChange={(e) => setLevel(e.target.value)}
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
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {thumbnailUrl && (
              <div className="w-48 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" disabled={isSaving} className="text-xs gap-2">
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Course Settings'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* CREATE LESSON MODAL */}
      {activeSectionIdForLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">Add New Lesson</h3>

            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2. Understanding Core Principles"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={lessonForm.durationMinutes}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value) || 10 })
                  }
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Video Stream URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lesson Text / Article Content</label>
                <textarea
                  rows={3}
                  placeholder="In-depth textual guide or notes for this lesson..."
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Downloadable Resource URL</label>
                  <input
                    type="url"
                    placeholder="https://.../resources.pdf"
                    value={lessonForm.downloadableUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, downloadableUrl: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">External Resource Link</label>
                  <input
                    type="url"
                    placeholder="https://resources.example.com"
                    value={lessonForm.externalUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="preview-check"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="preview-check" className="font-bold text-slate-700">
                  Allow Free Preview (Available before enrollment)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSectionIdForLesson(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Lesson
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT LESSON MODAL */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">Edit Lesson Details</h3>

            <form onSubmit={handleUpdateLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={editingLesson.durationMinutes || 10}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      durationMinutes: parseInt(e.target.value) || 10,
                    })
                  }
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Video Stream URL</label>
                <input
                  type="url"
                  value={editingLesson.videoUrl || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lesson Text / Article Content</label>
                <textarea
                  rows={3}
                  value={editingLesson.content || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Downloadable Resource URL</label>
                  <input
                    type="url"
                    value={editingLesson.downloadableUrl || ''}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, downloadableUrl: e.target.value })
                    }
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">External Documentation Link</label>
                  <input
                    type="url"
                    value={editingLesson.externalUrl || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, externalUrl: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-preview-check"
                  checked={Boolean(editingLesson.isFreePreview)}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, isFreePreview: e.target.checked })
                  }
                  className="rounded text-indigo-600"
                />
                <label htmlFor="edit-preview-check" className="font-bold text-slate-700">
                  Allow Free Preview
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingLesson(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Update Lesson
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
