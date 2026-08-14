export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  courseCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // seconds
  order: number;
  isFreePreview: boolean;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  level: CourseLevel;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
  instructorAvatar?: string;
  instructorHeadline?: string;
  instructorBio?: string;
  isPublished: boolean;
  featured?: boolean;
  lessons?: Lesson[];
  sections?: Section[];
  durationMinutes?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  reviewsList?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  courseCount: number;
  studentCount: number;
  rating: number;
}

export interface InstructorDetail extends Instructor {
  email: string;
  reviewCount: number;
  courses: Course[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course?: Course;
  enrolledAt: string;
  progress: number; // 0-100
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface PlatformStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: Enrollment[];
}
