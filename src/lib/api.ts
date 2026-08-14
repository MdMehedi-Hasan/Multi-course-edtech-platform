import { AuthResponse, User, Course, Enrollment, Category, PlatformStats } from '../types/index';

const TOKEN_KEY = 'edtech_access_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || `HTTP Error ${response.status}`);
  }

  // Handle standard API response envelope { success: true, data: T }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const api = {
  // Auth API
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  googleAuth: (data: { email: string; name: string; avatarUrl?: string; googleId?: string }) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitInstructorApplication: (data: {
    name: string;
    email: string;
    bio: string;
    expertise: string;
    experienceYears?: number;
    headline?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    message: string;
  }) =>
    request<any>('/auth/instructor-application', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyInstructorApplication: () => request<any>('/auth/instructor-application/me'),

  demoLogin: (role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    const emailMap = {
      STUDENT: 'student@ednexus.edu',
      INSTRUCTOR: 'instructor@ednexus.edu',
      ADMIN: 'admin@ednexus.edu',
    };
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailMap[role],
        password: 'password123',
      }),
    });
  },

  getMe: async () => {
    const rawUser = await request<any>('/auth/me');
    const user: User = {
      id: rawUser.id,
      email: rawUser.email,
      name: rawUser.profile?.name || rawUser.email.split('@')[0],
      role: rawUser.role,
      avatarUrl: rawUser.profile?.avatarUrl,
      createdAt: rawUser.createdAt,
    };
    return { user };
  },

  logout: () =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Courses API
  getCategories: () => request<Category[]>('/courses/categories'),

  getCourses: (params?: { categoryId?: string; level?: string; search?: string; instructorId?: string }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.level) query.append('level', params.level);
    if (params?.search) query.append('search', params.search);
    if (params?.instructorId) query.append('instructorId', params.instructorId);

    const qString = query.toString();
    return request<Course[]>(`/courses${qString ? `?${qString}` : ''}`);
  },

  getCourseById: (id: string) => request<Course>(`/courses/${id}`),

  createCourse: (data: Partial<Course>) =>
    request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Enrollments API
  getMyEnrollments: () => request<Enrollment[]>('/enrollments/me'),

  enroll: (courseId: string) =>
    request<Enrollment>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),

  updateProgress: (courseId: string, lessonId: string) =>
    request<Enrollment>('/enrollments/progress', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId }),
    }),

  // Instructors Public API
  getInstructors: () => request<import('../types/index').Instructor[]>('/instructors'),

  getInstructorById: (id: string) => request<import('../types/index').InstructorDetail>(`/instructors/${id}`),

  // Instructor Portal Management API
  getInstructorDashboard: () => request<any>('/instructors/me/dashboard'),

  getInstructorCourses: () => request<any[]>('/instructors/me/courses'),

  getInstructorCourseDetail: (id: string) => request<any>(`/instructors/me/courses/${id}`),

  createInstructorCourse: (data: any) =>
    request<any>('/instructors/me/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInstructorCourse: (id: string, data: any) =>
    request<any>(`/instructors/me/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  publishInstructorCourse: (id: string, isPublished: boolean) =>
    request<any>(`/instructors/me/courses/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    }),

  deleteInstructorCourse: (id: string) =>
    request<{ success: boolean }>(`/instructors/me/courses/${id}`, {
      method: 'DELETE',
    }),

  addCourseSection: (courseId: string, title: string) =>
    request<any>(`/instructors/me/courses/${courseId}/sections`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  updateCourseSection: (courseId: string, sectionId: string, title: string) =>
    request<any>(`/instructors/me/courses/${courseId}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }),

  deleteCourseSection: (courseId: string, sectionId: string) =>
    request<{ success: boolean }>(`/instructors/me/courses/${courseId}/sections/${sectionId}`, {
      method: 'DELETE',
    }),

  reorderCourseSections: (courseId: string, sectionOrders: { id: string; orderIndex: number }[]) =>
    request<any>(`/instructors/me/courses/${courseId}/sections/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ sectionOrders }),
    }),

  addCourseLesson: (courseId: string, sectionId: string, data: any) =>
    request<any>(`/instructors/me/courses/${courseId}/sections/${sectionId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourseLesson: (courseId: string, lessonId: string, data: any) =>
    request<any>(`/instructors/me/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCourseLesson: (courseId: string, lessonId: string) =>
    request<{ success: boolean }>(`/instructors/me/courses/${courseId}/lessons/${lessonId}`, {
      method: 'DELETE',
    }),

  reorderCourseLessons: (courseId: string, sectionId: string, lessonOrders: { id: string; orderIndex: number }[]) =>
    request<any>(`/instructors/me/courses/${courseId}/sections/${sectionId}/lessons/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ lessonOrders }),
    }),

  getInstructorStudents: () => request<any[]>('/instructors/me/students'),

  getInstructorAnalytics: () => request<any>('/instructors/me/analytics'),

  getInstructorReviews: () => request<any[]>('/instructors/me/reviews'),

  getInstructorProfile: () => request<any>('/instructors/me/profile'),

  updateInstructorProfile: (data: any) =>
    request<any>('/instructors/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changeInstructorPassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/instructors/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin API
  getAdminStats: () => request<any>('/admin/stats'),

  getAdminUsers: (params?: { role?: string; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.append('role', params.role);
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    const qStr = q.toString();
    return request<any[]>(`/admin/users${qStr ? `?${qStr}` : ''}`);
  },

  getAdminUserDetail: (id: string) => request<any>(`/admin/users/${id}`),

  updateUserRole: (userId: string, role: string) =>
    request<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (userId: string, data: { isSuspended: boolean; suspensionReason?: string }) =>
    request<any>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    request<{ success: boolean }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getAdminInstructors: () => request<any[]>('/admin/instructors'),

  approveInstructor: (id: string, isInstructorApproved: boolean) =>
    request<any>(`/admin/instructors/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isInstructorApproved }),
    }),

  getAdminInstructorApplications: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const qStr = q.toString();
    return request<any[]>(`/admin/instructor-applications${qStr ? `?${qStr}` : ''}`);
  },

  getAdminInstructorApplicationDetail: (id: string) =>
    request<any>(`/admin/instructor-applications/${id}`),

  reviewAdminInstructorApplication: (id: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) =>
    request<any>(`/admin/instructor-applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    }),

  getAdminCourses: (params?: { search?: string; categoryId?: string; isPublished?: boolean; isApproved?: boolean; isFeatured?: boolean; isArchived?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.categoryId) q.append('categoryId', params.categoryId);
    if (params?.isPublished !== undefined) q.append('isPublished', String(params.isPublished));
    if (params?.isApproved !== undefined) q.append('isApproved', String(params.isApproved));
    if (params?.isFeatured !== undefined) q.append('isFeatured', String(params.isFeatured));
    if (params?.isArchived !== undefined) q.append('isArchived', String(params.isArchived));
    const qStr = q.toString();
    return request<any[]>(`/admin/courses${qStr ? `?${qStr}` : ''}`);
  },

  publishAdminCourse: (id: string, isPublished: boolean) =>
    request<any>(`/admin/courses/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),

  approveAdminCourse: (id: string, isApproved: boolean) =>
    request<any>(`/admin/courses/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  featureAdminCourse: (id: string, isFeatured: boolean) =>
    request<any>(`/admin/courses/${id}/feature`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    }),

  archiveAdminCourse: (id: string, isArchived: boolean) =>
    request<any>(`/admin/courses/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived }),
    }),

  deleteAdminCourse: (id: string) =>
    request<{ success: boolean }>(`/admin/courses/${id}`, {
      method: 'DELETE',
    }),

  getAdminCategories: () => request<any[]>('/admin/categories'),

  createAdminCategory: (data: { name: string; slug?: string; description?: string; iconName?: string; isActive?: boolean; orderIndex?: number }) =>
    request<any>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdminCategory: (id: string, data: any) =>
    request<any>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdminCategory: (id: string) =>
    request<{ success: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  reorderAdminCategories: (categoryOrders: { id: string; orderIndex: number }[]) =>
    request<any>('/admin/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ categoryOrders }),
    }),

  getAdminEnrollments: () => request<any[]>('/admin/enrollments'),

  getAdminReviews: (filter?: 'all' | 'reported' | 'moderated') =>
    request<any[]>(`/admin/reviews${filter ? `?filter=${filter}` : ''}`),

  flagAdminReview: (id: string, data: { isReported?: boolean; isModerated?: boolean; reportReason?: string }) =>
    request<any>(`/admin/reviews/${id}/flag`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAdminReview: (id: string) =>
    request<{ success: boolean }>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    }),

  getAdminAuditLogs: (params?: { action?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.action) q.append('action', params.action);
    if (params?.search) q.append('search', params.search);
    const qStr = q.toString();
    return request<any[]>(`/admin/audit-logs${qStr ? `?${qStr}` : ''}`);
  },

  getAdminSettings: () => request<any>('/admin/settings'),

  updateAdminSettings: (data: any) =>
    request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  broadcastAdminNotification: (data: { title: string; message: string; linkUrl?: string; targetRole?: string }) =>
    request<any>('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAdminReports: () => request<any>('/admin/reports'),

  // Student Experience API
  getStudentDashboard: () => request<any>('/student/dashboard'),

  getStudentCourses: () => request<any[]>('/student/courses'),

  getStudentCourseDetail: (courseId: string) => request<any>(`/student/courses/${courseId}`),

  getStudentLesson: (courseId: string, lessonId: string) =>
    request<any>(`/student/learn/${courseId}/lessons/${lessonId}`),

  saveStudentProgress: (data: { courseId: string; lessonId: string; watchedSeconds?: number; isCompleted?: boolean }) =>
    request<any>('/student/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudentProgressSummary: () => request<any>('/student/progress'),

  getStudentWishlist: () => request<any[]>('/student/wishlist'),

  addToStudentWishlist: (courseId: string) =>
    request<any>('/student/wishlist', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),

  removeFromStudentWishlist: (courseId: string) =>
    request<{ success: boolean }>(`/student/wishlist/${courseId}`, {
      method: 'DELETE',
    }),

  getStudentReviews: () => request<any[]>('/student/reviews'),

  submitStudentReview: (data: { courseId: string; rating: number; comment: string }) =>
    request<any>('/student/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudentProfile: () => request<any>('/student/profile'),

  updateStudentProfile: (data: any) =>
    request<any>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changeStudentPassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/student/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudentNotifications: () => request<any[]>('/student/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/student/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/student/notifications/read-all', {
      method: 'POST',
    }),
};
