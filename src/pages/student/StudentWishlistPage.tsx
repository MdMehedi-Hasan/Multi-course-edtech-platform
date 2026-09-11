import React, { useEffect, useState } from 'react';
import { Heart, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StudentWishlistPageProps {
  onNavigate: (path: string) => void;
}

export const StudentWishlistPage: React.FC<StudentWishlistPageProps> = ({ onNavigate }) => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const res = await api.getStudentWishlist();
        setWishlist(res);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const handleRemove = async (courseId: string) => {
    try {
      await api.removeFromStudentWishlist(courseId);
      setWishlist((prev) => prev.filter((item) => item.courseId !== courseId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-1">Courses you have saved for future learning and skill development.</p>
      </div>

      {wishlist.length === 0 ? (
        <Card className="p-12 text-center border-slate-200">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse our course catalog and bookmark courses to keep track of topics you plan to study.
          </p>
          <Button variant="default" size="sm" onClick={() => onNavigate('/courses')} className="mt-4">
            Explore Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col justify-between border-slate-200 hover:border-slate-300 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.course?.categoryName || 'Engineering'}
                  </span>
                  <button
                    onClick={() => handleRemove(item.courseId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{item.course?.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.course?.shortDescription}</p>
                <p className="text-xs text-slate-400">Instructor: {item.course?.instructorName}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-base">${item.course?.price}</span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onNavigate(`/courses/${item.course?.slug || item.courseId}`)}
                  className="text-xs gap-1"
                >
                  <span>View Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
