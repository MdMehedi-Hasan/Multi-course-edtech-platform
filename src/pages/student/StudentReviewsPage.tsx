import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface StudentReviewsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentReviewsPage: React.FC<StudentReviewsPageProps> = ({ onNavigate }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [revs, courses] = await Promise.all([
          api.getStudentReviews(),
          api.getStudentCourses(),
        ]);
        setReviews(revs);
        setEnrolledCourses(courses);
        if (courses.length > 0) {
          setSelectedCourseId(courses[0].courseId);
        }
      } catch (err) {
        console.error('Failed to load student reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setFormError('Please select a course to review.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please enter a review comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      await api.submitStudentReview({
        courseId: selectedCourseId,
        rating,
        comment: comment.trim(),
      });

      setFormSuccess('Review submitted successfully!');
      setComment('');
      const updatedRevs = await api.getStudentReviews();
      setReviews(updatedRevs);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError(err.message || 'Unauthorized: You can only review courses you are enrolled in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        <div className="space-y-2 pb-6 border-b border-slate-700/50">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-44 rounded-lg" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full bg-slate-900/60 text-slate-100 placeholder:text-slate-500 p-2.5 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-indigo-500';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> My Course Reviews
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Share your feedback and rating for courses you are enrolled in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Review Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Write a Review
            </h2>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {enrolledCourses.length === 0 ? (
              <p className="text-xs text-slate-400">
                You must be enrolled in at least one course before submitting a review.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Enrolled Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className={inputClass}
                  >
                    {enrolledCourses.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Review Feedback
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your learning experience, quality of instruction, and feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  disabled={isSubmitting}
                  className="w-full text-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Existing Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Your Submitted Reviews</h2>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              You have not submitted any course reviews yet.
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-sm">{rev.courseTitle}</h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
