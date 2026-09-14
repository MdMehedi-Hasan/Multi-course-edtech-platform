import React, { useEffect, useState } from 'react';
import { Globe, Github, Linkedin, CheckCircle, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface StudentProfilePageProps {
  onNavigate: (path: string) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>({
    name: '',
    email: '',
    headline: '',
    bio: '',
    avatarUrl: '',
    website: '',
    github: '',
    linkedin: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getStudentProfile();
        setProfileData(res);
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMsg(null);
      await api.updateStudentProfile(profileData);
      setSuccessMsg('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2 pb-6 border-b border-slate-700/50">
            <Skeleton className="h-7 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-72 rounded-2xl" />
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
        <h1 className="text-2xl font-black text-slate-100">Student Profile & Identity</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your public learning profile, bio, and social links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-6">
            <h2 className="text-base font-extrabold text-slate-100">Personal Information</h2>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address (Read Only)
                  </label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    disabled
                    className="w-full bg-slate-700/40 text-slate-500 p-2.5 text-xs rounded-xl border border-slate-700/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science Student | Aspiring Full Stack Engineer"
                  value={profileData.headline || ''}
                  onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bio / Learning Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell instructors and fellow students about your goals, interests, and background..."
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={profileData.avatarUrl || ''}
                  onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="pt-4 border-t border-slate-700/50 space-y-4">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://myportfolio.com"
                      value={profileData.website || ''}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      GitHub
                    </label>
                    <input
                      type="text"
                      placeholder="github-username"
                      value={profileData.github || ''}
                      onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      placeholder="linkedin-username"
                      value={profileData.linkedin || ''}
                      onChange={(e) =>
                        setProfileData({ ...profileData, linkedin: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="default" disabled={isSaving} className="gap-2 text-xs">
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Profile Card Preview */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-100">Live Profile Card Preview</h2>
          <Card className="p-6 text-center space-y-4 bg-gradient-to-b from-slate-700/40 to-slate-800">
            <div className="w-20 h-20 rounded-full bg-indigo-500/15 text-indigo-400 font-black text-2xl flex items-center justify-center mx-auto overflow-hidden border-2 border-indigo-500/30">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profileData.name?.[0]?.toUpperCase() || 'S'
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                {profileData.name || 'Student Name'}
              </h3>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">
                {profileData.headline || 'Student Learner'}
              </p>
            </div>

            <p className="text-xs text-slate-400 line-clamp-3 italic">
              &ldquo;{profileData.bio || 'No bio provided yet.'}&rdquo;
            </p>

            <div className="flex justify-center gap-3 pt-2 text-slate-500">
              {profileData.website && <Globe className="w-4 h-4 hover:text-slate-200" />}
              {profileData.github && <Github className="w-4 h-4 hover:text-slate-200" />}
              {profileData.linkedin && <Linkedin className="w-4 h-4 hover:text-slate-200" />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
