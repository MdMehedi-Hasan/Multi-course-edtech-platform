import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  ShieldAlert,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Download,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface CourseLearningPageProps {
  courseId: string;
  lessonId: string;
  onNavigate: (path: string) => void;
}

export const CourseLearningPage: React.FC<CourseLearningPageProps> = ({
  courseId,
  lessonId,
  onNavigate,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  // Video player local state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources' | 'discussion'>('overview');
  const [userNote, setUserNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Debounce/Throttle progress saving ref
  const lastSavedTimeRef = useRef<number>(0);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  useEffect(() => {
    async function loadLessonData() {
      try {
        setIsLoading(!data);
        setAccessDeniedMsg(null);
        const res = await api.getStudentLesson(courseId, lessonId);
        setData(res);
        if (res.userProgress?.watchedSeconds) {
          setCurrentTime(res.userProgress.watchedSeconds);
        }
      } catch (err: any) {
        console.error('Failed to load lesson:', err);
        setAccessDeniedMsg(err.message || 'Access Denied: You must be enrolled in this course to access this lesson.');
      } finally {
        setIsLoading(false);
      }
    }

    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId]);

  // Handle throttled progress saving (every 5 seconds of video playback)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const nowSec = videoRef.current.currentTime;
    setCurrentTime(nowSec);

    if (Math.abs(nowSec - lastSavedTimeRef.current) > 5) {
      lastSavedTimeRef.current = nowSec;
      api.saveStudentProgress({
        courseId,
        lessonId,
        watchedSeconds: Math.floor(nowSec),
      }).catch(err => console.error('Auto progress save error:', err));
    }
  };

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    try {
      setIsSavingProgress(true);
      await api.saveStudentProgress({
        courseId,
        lessonId,
        watchedSeconds: Math.floor(duration),
        isCompleted: true,
      });
      // Refresh lesson state to show completed checkmark
      const updated = await api.getStudentLesson(courseId, lessonId);
      setData(updated);
    } catch (err) {
      console.error('Failed to mark complete on video end:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleManualCompleteToggle = async () => {
    if (!data) return;
    const currentStatus = data.userProgress?.isCompleted;
    try {
      setIsSavingProgress(true);
      await api.saveStudentProgress({
        courseId,
        lessonId,
        isCompleted: !currentStatus,
      });
      const updated = await api.getStudentLesson(courseId, lessonId);
      setData(updated);
    } catch (err) {
      console.error('Failed to update lesson completion status:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNote.trim()) return;
    const timestampStr = new Date(currentTime * 1000).toISOString().substring(14, 19);
    setSavedNotes((prev) => [`[${timestampStr}] ${userNote.trim()}`, ...prev]);
    setUserNote('');
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (accessDeniedMsg) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Card className="p-8 border-rose-200 bg-rose-50/60 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Enrollment Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{accessDeniedMsg}</p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => onNavigate('/student/courses')}>
              Back to My Courses
            </Button>
            <Button variant="default" onClick={() => onNavigate(`/courses/${courseId}`)}>
              Enroll in Course
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { lesson, course, sections = [], nextLessonId, prevLessonId, userProgress } = data || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Learning Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => onNavigate(`/student/courses/${courseId}`)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="Return to Course Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 truncate">
              {course?.title}
            </p>
            <h1 className="text-sm font-bold text-white truncate">{lesson?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant={userProgress?.isCompleted ? 'default' : 'outline'}
            size="sm"
            onClick={handleManualCompleteToggle}
            disabled={isSavingProgress}
            className={`gap-2 text-xs border-slate-700 ${
              userProgress?.isCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{userProgress?.isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Grid (Left: Curriculum, Center: Player, Bottom: Info/Notes) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Course Curriculum */}
        <aside className="w-full lg:w-80 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col shrink-0 max-h-[350px] lg:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Course Content
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              {data?.overallCourseProgress || 0}% Complete
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {sections.map((sec: any, sIdx: number) => (
              <div key={sec.id} className="p-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Section {sIdx + 1}: {sec.title}
                </h3>
                <div className="space-y-1">
                  {sec.lessons.map((l: any) => {
                    const isCurrent = l.id === lessonId;
                    return (
                      <button
                        key={l.id}
                        onClick={() => onNavigate(`/student/learn/${courseId}/${l.id}`)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
                          isCurrent
                            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                            : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {l.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{l.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{l.durationMinutes}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center/Right Container */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Video Player Box */}
          <div className="relative bg-black w-full aspect-video max-h-[500px] flex items-center justify-center group border-b border-slate-800">
            {getYoutubeEmbedUrl(lesson?.externalUrl) ? (
              <iframe
                title={lesson?.title || 'Course lesson'}
                src={getYoutubeEmbedUrl(lesson?.externalUrl) || undefined}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={lesson?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration);
                }}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain"
              />
            )}

            {/* Custom Video Controls Overlay */}
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-2 opacity-100 group-hover:opacity-100 transition-opacity ${getYoutubeEmbedUrl(lesson?.externalUrl) ? 'hidden' : ''}`}>
              {/* Timeline bar */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="p-1.5 hover:text-indigo-400 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button onClick={toggleMute} className="p-1.5 hover:text-indigo-400 transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span>
                    {new Date(currentTime * 1000).toISOString().substring(14, 19)} /{' '}
                    {new Date(duration * 1000).toISOString().substring(14, 19)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback speed selector */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2.0}>2.0x</option>
                  </select>

                  <button onClick={toggleFullscreen} className="p-1.5 hover:text-indigo-400 transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Navigation Toolbar */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevLessonId}
              onClick={() => prevLessonId && onNavigate(`/student/learn/${courseId}/${prevLessonId}`)}
              className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Lesson
            </Button>

            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Lesson Duration: {lesson?.durationMinutes} mins
            </span>

            <Button
              variant="default"
              size="sm"
              disabled={!nextLessonId}
              onClick={() => nextLessonId && onNavigate(`/student/learn/${courseId}/${nextLessonId}`)}
              className="gap-2 text-xs"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Lesson Info & Interactive Tabs */}
          <div className="p-6 space-y-6 max-w-5xl">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 transition-colors ${
                  activeTab === 'overview'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 transition-colors ${
                  activeTab === 'notes'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Notes ({savedNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 transition-colors ${
                  activeTab === 'resources'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resources & Attachments
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
                <h3 className="text-sm font-bold text-white">{lesson?.title}</h3>
                <p>
                  This video lesson covers fundamental principles, production code design patterns, and
                  real-world engineering workflows. Follow along with the video playback and take custom notes.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type a personal note timestamped to your video playback position..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full bg-slate-900 text-slate-200 p-3 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <Button type="submit" variant="default" size="sm" className="text-xs">
                    Save Timestamped Note
                  </Button>
                </form>

                <div className="space-y-2">
                  {savedNotes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="font-bold text-white">Lesson Source Code Repository.zip</p>
                      <p className="text-[10px] text-slate-500">Exercise files and solution branch</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-slate-700 text-slate-300">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
