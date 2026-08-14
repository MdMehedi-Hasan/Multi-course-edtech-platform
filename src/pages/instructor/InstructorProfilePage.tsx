import React, { useEffect, useState } from 'react';
import { User, Save, CheckCircle2, ShieldAlert, Globe, Github, Linkedin } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorProfilePageProps {
  onNavigate: (path: string) => void;
}

export const InstructorProfilePage: React.FC<InstructorProfilePageProps> = () => {
  const [profile, setProfile] = useState({
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = await api.getInstructorProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          headline: data.headline || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
          website: data.website || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await api.updateInstructorProfile(profile);
      setSuccessMsg('Instructor profile updated successfully.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
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
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">Instructor Bio & Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize how your instructor profile appears to students on course landing pages.
        </p>
      </div>

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

      <Card className="p-6 border-slate-200 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="flex items-center gap-4">
            <img
              src={
                profile.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
              }
              alt="Avatar Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600"
            />
            <div className="flex-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-slate-100 text-slate-500 p-2.5 rounded-xl border border-slate-200 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              placeholder="e.g., Staff Engineer & Author of Advanced System Architecture"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Instructor Biography
            </label>
            <textarea
              rows={4}
              placeholder="Share your career experience, teaching philosophy, and engineering background..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="block font-bold text-slate-800 text-xs">Social Links</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                  <Github className="w-3 h-3" /> GitHub
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={isSaving} className="text-xs gap-2">
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
