import bcrypt from 'bcryptjs';
import { User, Course, Lesson, Enrollment, Category, UserRole } from '../../src/types/index.js';

// Pre-hashed default password 'password123'
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export class DataStore {
  private users: User[] = [
    {
      id: 'usr_student_1',
      name: 'Alex Johnson',
      email: 'student@example.com',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Enthusiastic lifelong learner interested in business strategy, digital design, and emerging technology.',
      headline: 'Lifelong Learner & Graduate Student',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_instructor_1',
      name: 'Dr. Sarah Chen',
      email: 'instructor@example.com',
      role: 'INSTRUCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Management consultant and educator with 12+ years of experience advising international businesses and teaching strategy.',
      headline: 'Executive Leadership Coach & Senior Educator',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_instructor_2',
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      role: 'INSTRUCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Creative director with over a decade of experience designing brand identities and visual systems for global campaigns.',
      headline: 'Creative Director & Brand Strategist',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_admin_1',
      name: 'Elena Rostova',
      email: 'admin@example.com',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      bio: 'Global EdTech Director managing quality assurance, curriculum standards, and instructor partnerships.',
      headline: 'Platform Administrator',
      createdAt: new Date().toISOString(),
    },
  ];

  private passwords: Record<string, string> = {
    'student@example.com': DEFAULT_PASSWORD_HASH,
    'instructor@example.com': DEFAULT_PASSWORD_HASH,
    'marcus@example.com': DEFAULT_PASSWORD_HASH,
    'admin@example.com': DEFAULT_PASSWORD_HASH,
  };

  private categories: Category[] = [
    {
      id: 'cat_business',
      name: 'Business & Management',
      slug: 'business-management',
      icon: 'Briefcase',
      description: 'Strategic leadership, financial intelligence, project management, and entrepreneurship.',
      courseCount: 3,
    },
    {
      id: 'cat_marketing',
      name: 'Digital Marketing & Growth',
      slug: 'digital-marketing',
      icon: 'TrendingUp',
      description: 'SEO mastery, content strategy, brand building, and multi-channel campaign analytics.',
      courseCount: 2,
    },
    {
      id: 'cat_design',
      name: 'Design & Creative Arts',
      slug: 'design-creative',
      icon: 'Palette',
      description: 'UI/UX design, visual identity, digital illustration, and creative brand direction.',
      courseCount: 3,
    },
    {
      id: 'cat_tech',
      name: 'Technology & Programming',
      slug: 'technology-programming',
      icon: 'Code',
      description: 'Modern software engineering, web development, and cloud architecture.',
      courseCount: 4,
    },
    {
      id: 'cat_data',
      name: 'Data Science & AI',
      slug: 'data-science-ai',
      icon: 'Cpu',
      description: 'Applied machine learning, statistical analytics, and predictive modeling.',
      courseCount: 2,
    },
    {
      id: 'cat_languages',
      name: 'Language & Communication',
      slug: 'language-communication',
      icon: 'Globe',
      description: 'Professional public speaking, business communication, and language fluency.',
      courseCount: 2,
    },
  ];

  private courses: Course[] = [
    {
      id: 'crs_business_101',
      title: 'Executive Leadership & Strategic Decision Making',
      slug: 'executive-leadership-strategic-decision-making',
      shortDescription: 'Master organizational strategy, team alignment, crisis navigation, and high-stakes decision frameworks.',
      description: 'An executive-level masterclass for aspiring managers, team leaders, and founders. Learn practical methodologies to lead high-performing cross-functional teams, formulate data-backed strategic roadmaps, negotiate successfully, and foster resilient organizational culture.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
      price: 79.99,
      rating: 4.9,
      reviewCount: 342,
      studentCount: 1420,
      level: 'INTERMEDIATE',
      categoryId: 'cat_business',
      categoryName: 'Business & Management',
      instructorId: 'usr_instructor_1',
      instructorName: 'Dr. Sarah Chen',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isPublished: true,
      featured: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crs_marketing_growth',
      title: 'Growth Marketing & Multi-Channel Campaign Strategy',
      slug: 'growth-marketing-campaign-strategy',
      shortDescription: 'Execute data-driven organic and paid acquisition strategies that scale revenue sustainably.',
      description: 'Unlock modern marketing playbooks used by leading brands. Discover the full customer journey lifecycle, master performance marketing channels, optimize conversion funnels, and develop high-retention email nurture sequences.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      price: 59.99,
      rating: 4.85,
      reviewCount: 215,
      studentCount: 1120,
      level: 'BEGINNER',
      categoryId: 'cat_marketing',
      categoryName: 'Digital Marketing & Growth',
      instructorId: 'usr_instructor_2',
      instructorName: 'Marcus Vance',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isPublished: true,
      featured: true,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crs_design_systems',
      title: 'Design Systems & Modern Product UI/UX',
      slug: 'design-systems-modern-ui-ux',
      shortDescription: 'Create scalable design tokens, accessible components, and cohesive brand experiences.',
      description: 'Learn the exact principles and workflows behind world-class product interfaces. Master visual rhythm, typography scales, accessibility guidelines (WCAG), interactive prototyping, and design-to-production handoffs.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      price: 69.99,
      rating: 4.95,
      reviewCount: 412,
      studentCount: 2150,
      level: 'INTERMEDIATE',
      categoryId: 'cat_design',
      categoryName: 'Design & Creative Arts',
      instructorId: 'usr_instructor_2',
      instructorName: 'Marcus Vance',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isPublished: true,
      featured: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private lessons: Record<string, Lesson[]> = {
    'crs_business_101': [
      {
        id: 'lsn_1_1',
        courseId: 'crs_business_101',
        title: 'Course Overview & Strategic Vision Alignment',
        description: 'Establishing strategic objectives, stakeholder mapping, and high-impact execution roadmaps.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 720, // 12 mins
        order: 1,
        isFreePreview: true,
      },
      {
        id: 'lsn_1_2',
        courseId: 'crs_business_101',
        title: 'Analytical Frameworks for Complex Decision Making',
        description: 'Risk assessment matrixes, scenario analysis, and avoiding cognitive cognitive biases.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 1080, // 18 mins
        order: 2,
        isFreePreview: false,
      },
      {
        id: 'lsn_1_3',
        courseId: 'crs_business_101',
        title: 'Leading Through Change & Organizational Culture',
        description: 'Effective communication strategies during restructuring and scaling phases.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 900, // 15 mins
        order: 3,
        isFreePreview: false,
      },
    ],
    'crs_marketing_growth': [
      {
        id: 'lsn_2_1',
        courseId: 'crs_marketing_growth',
        title: 'Modern Marketing Funnels & Customer Psychology',
        description: 'Mapping awareness, intent, activation, and customer retention loops.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 640,
        order: 1,
        isFreePreview: true,
      },
      {
        id: 'lsn_2_2',
        courseId: 'crs_marketing_growth',
        title: 'Organic Search, Content Loops, and Channel Fit',
        description: 'Evaluating high-converting acquisition channels for your target market.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 850,
        order: 2,
        isFreePreview: false,
      },
    ],
    'crs_design_systems': [
      {
        id: 'lsn_3_1',
        courseId: 'crs_design_systems',
        title: 'Foundations of Optical Rhythm & Typography Scales',
        description: 'Setting up mathematical step ratios and baseline consistency.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 950,
        order: 1,
        isFreePreview: true,
      },
    ],
  };

  private enrollments: Enrollment[] = [
    {
      id: 'enr_1',
      studentId: 'usr_student_1',
      courseId: 'crs_business_101',
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 33,
      completedLessonIds: ['lsn_1_1'],
      lastAccessedLessonId: 'lsn_1_2',
    },
  ];

  // User Operations
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>, passwordPlain: string): User {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.passwords[newUser.email.toLowerCase()] = bcrypt.hashSync(passwordPlain, 10);
    return newUser;
  }

  verifyPassword(email: string, passwordPlain: string): boolean {
    const hash = this.passwords[email.toLowerCase()];
    if (!hash) return false;
    return bcrypt.compareSync(passwordPlain, hash);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUserRole(userId: string, role: UserRole): User | undefined {
    const user = this.findUserById(userId);
    if (user) {
      user.role = role;
    }
    return user;
  }

  // Category Operations
  getCategories(): Category[] {
    return this.categories;
  }

  // Course Operations
  getCourses(filters?: { categoryId?: string; level?: string; search?: string; instructorId?: string }): Course[] {
    let result = [...this.courses];
    if (filters?.categoryId) {
      result = result.filter((c) => c.categoryId === filters.categoryId);
    }
    if (filters?.level) {
      result = result.filter((c) => c.level === filters.level);
    }
    if (filters?.instructorId) {
      result = result.filter((c) => c.instructorId === filters.instructorId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getCourseById(id: string): Course | undefined {
    const course = this.courses.find((c) => c.id === id || c.slug === id);
    if (course) {
      const courseLessons = this.lessons[course.id] || [];
      return { ...course, lessons: courseLessons };
    }
    return undefined;
  }

  createCourse(courseData: Partial<Course> & { title: string; instructorId: string }): Course {
    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      title: courseData.title,
      slug: courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: courseData.description || '',
      shortDescription: courseData.shortDescription || '',
      thumbnailUrl: courseData.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      price: courseData.price || 49.99,
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      level: courseData.level || 'BEGINNER',
      categoryId: courseData.categoryId || 'cat_dev',
      categoryName: this.categories.find((c) => c.id === courseData.categoryId)?.name || 'Web Development',
      instructorId: courseData.instructorId,
      instructorName: this.findUserById(courseData.instructorId)?.name || 'Instructor',
      instructorAvatar: this.findUserById(courseData.instructorId)?.avatarUrl,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.courses.push(newCourse);
    this.lessons[newCourse.id] = [
      {
        id: `lsn_${Date.now()}_1`,
        courseId: newCourse.id,
        title: 'Course Introduction',
        description: 'Welcome to this course! Overview of tools and objectives.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 480,
        order: 1,
        isFreePreview: true,
      },
    ];

    return newCourse;
  }

  // Enrollment Operations
  getEnrollmentsByStudent(studentId: string): Enrollment[] {
    const studentEnrollments = this.enrollments.filter((e) => e.studentId === studentId);
    return studentEnrollments.map((e) => ({
      ...e,
      course: this.getCourseById(e.courseId),
    }));
  }

  getEnrollment(studentId: string, courseId: string): Enrollment | undefined {
    return this.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
  }

  enrollStudent(studentId: string, courseId: string): Enrollment {
    let existing = this.getEnrollment(studentId, courseId);
    if (existing) return existing;

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessonIds: [],
    };
    this.enrollments.push(newEnrollment);

    // Increment course student count
    const course = this.courses.find((c) => c.id === courseId);
    if (course) {
      course.studentCount += 1;
    }

    return newEnrollment;
  }

  updateLessonProgress(studentId: string, courseId: string, lessonId: string): Enrollment | undefined {
    const enrollment = this.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) return undefined;

    if (!enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);
    }

    const courseLessons = this.lessons[courseId] || [];
    const totalLessons = courseLessons.length || 1;
    enrollment.progress = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
    enrollment.lastAccessedLessonId = lessonId;

    return enrollment;
  }

  // Admin Stats
  getPlatformStats() {
    const totalStudents = this.users.filter((u) => u.role === 'STUDENT').length;
    const totalInstructors = this.users.filter((u) => u.role === 'INSTRUCTOR').length;
    const totalCourses = this.courses.length;
    const totalEnrollments = this.enrollments.length;
    const totalRevenue = this.courses.reduce((acc, c) => acc + c.price * c.studentCount, 0);

    return {
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      recentEnrollments: this.enrollments.slice(-5).map((e) => ({
        ...e,
        course: this.getCourseById(e.courseId),
      })),
    };
  }
}

export const db = new DataStore();
