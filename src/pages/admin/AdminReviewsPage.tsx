import React, { useEffect, useState } from 'react';
import { MessageSquareText, Star, ShieldAlert, CheckCircle2, Trash2, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reported' | 'moderated'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminReviews(filter);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch admin reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFlag = async (id: string, isReported: boolean, isModerated: boolean) => {
    try {
      await api.flagAdminReview(id, { isReported, isModerated });
      fetchReviews();
    } catch (err) {
      console.error('Failed to flag review:', err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteAdminReview(id);
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Review & Feedback Moderation</h1>
        <p className="text-xs text-slate-400 mt-1">Audit student feedback, moderate flagged ratings, and filter inappropriate comments.</p>
      </div>

      <Card className="p-4 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Reviews
        </Button>
        <Button
          variant={filter === 'reported' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('reported')}
        >
          Flagged / Reported
        </Button>
        <Button
          variant={filter === 'moderated' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('moderated')}
        >
          Moderated
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Course Title</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Comment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading feedback entries...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No reviews found matching filter.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-100">{r.studentName}</p>
                      <p className="text-[11px] text-slate-400">{r.studentEmail}</p>
                    </td>

                    <td className="px-4 py-4 font-bold text-purple-400 max-w-[180px] truncate">
                      {r.courseTitle}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{r.rating} / 5</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-slate-200 line-clamp-2">{r.comment || 'No text comment.'}</p>
                    </td>

                    <td className="px-4 py-4">
                      {r.isReported && (
                        <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded flex items-center gap-1 w-fit mb-1">
                          <ShieldAlert className="w-3 h-3" /> Reported
                        </span>
                      )}
                      {r.isModerated && (
                        <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Moderated
                        </span>
                      )}
                      {!r.isReported && !r.isModerated && (
                        <span className="text-[10px] font-bold bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded">Normal</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFlag(r.id, false, !r.isModerated)}
                          title={r.isModerated ? 'Unmark Moderated' : 'Mark as Moderated'}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${r.isModerated ? 'text-purple-400' : 'text-slate-400'}`} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(r.id)} title="Delete Review">
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
