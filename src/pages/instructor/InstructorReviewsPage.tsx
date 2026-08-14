import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

interface InstructorReviewsPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorReviewsPage: React.FC<InstructorReviewsPageProps> = ({ onNavigate }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const data = await api.getInstructorReviews();
        setReviews(data);
      } catch (err) {
        console.error('Failed to load instructor reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.9';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Student Reviews & Feedback</h1>
          <p className="text-xs text-slate-500 mt-1">
            Read authentic student reviews, feedback, and course satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl shrink-0">
          <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          <div>
            <span className="text-xl font-black text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-500 block font-medium">({reviews.length} Total Reviews)</span>
          </div>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500 border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          No student reviews submitted for your courses yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5 border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.studentAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                    }
                    alt={r.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.studentName}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-0.5">
                      Course: {r.courseTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-black text-slate-800 ml-1">{r.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pt-1">{r.comment}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Submitted on {new Date(r.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <ThumbsUp className="w-3 h-3" /> Verified Student
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
