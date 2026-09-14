import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { Navbar } from './components/layouts/Navbar';
import { Footer } from './components/layouts/Footer';
import { InstructorLayout } from './components/layouts/InstructorLayout';
import { StudentLayout } from './components/layouts/StudentLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { InstructorsPage } from './pages/public/InstructorsPage';
import { InstructorProfilePage } from './pages/public/InstructorProfilePage';
import { AboutPage } from './pages/public/AboutPage';
import { PricingPage } from './pages/public/PricingPage';
import { ContactPage } from './pages/public/ContactPage';
import { FAQPage } from './pages/public/FAQPage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { BecomeInstructorPage } from './pages/public/BecomeInstructorPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { StudentCourseDetailPage } from './pages/student/StudentCourseDetailPage';
import { CourseLearningPage } from './pages/student/CourseLearningPage';
import { StudentProgressPage } from './pages/student/StudentProgressPage';
import { StudentWishlistPage } from './pages/student/StudentWishlistPage';
import { StudentReviewsPage } from './pages/student/StudentReviewsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

// Instructor Pages
import { InstructorDashboardPage } from './pages/instructor/InstructorDashboardPage';
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage';
import { InstructorCourseCreatePage } from './pages/instructor/InstructorCourseCreatePage';
import { InstructorCourseEditPage } from './pages/instructor/InstructorCourseEditPage';
import { InstructorStudentsPage } from './pages/instructor/InstructorStudentsPage';
import { InstructorAnalyticsPage } from './pages/instructor/InstructorAnalyticsPage';
import { InstructorReviewsPage } from './pages/instructor/InstructorReviewsPage';
import { InstructorProfilePage as InstructorSelfProfilePage } from './pages/instructor/InstructorProfilePage';
import { InstructorSettingsPage } from './pages/instructor/InstructorSettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminInstructorsPage } from './pages/admin/AdminInstructorsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminEnrollmentsPage } from './pages/admin/AdminEnrollmentsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname || '/';
    const isDark = path.startsWith('/student') || path.startsWith('/instructor') || path.startsWith('/admin');
    document.documentElement.classList.toggle('dark', isDark);
    return path;
  });

  useEffect(() => {
    const isDark = currentPath.startsWith('/student') || currentPath.startsWith('/instructor') || currentPath.startsWith('/admin');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo(0, 0);
  };

  const isLearningPage = currentPath.startsWith('/student/learn/');

  const renderRoute = () => {
    // Learning Page Match: /student/learn/:courseId/:lessonId
    if (currentPath.startsWith('/student/learn/')) {
      const rest = currentPath.replace('/student/learn/', '');
      const parts = rest.split('/');
      const courseId = parts[0] || '';
      const lessonId = parts[1] || '';
      return (
        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
          <CourseLearningPage courseId={courseId} lessonId={lessonId} onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // Student Course Detail Match: /student/courses/:courseId
    if (
      currentPath.startsWith('/student/courses/') &&
      currentPath !== '/student/courses'
    ) {
      const courseId = currentPath.replace('/student/courses/', '');
      return (
        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
          <StudentCourseDetailPage courseId={courseId} onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // Course Detail Match: /courses/:id
    if (currentPath.startsWith('/courses/') && currentPath !== '/courses') {
      const courseId = currentPath.replace('/courses/', '');
      return <CourseDetailPage courseId={courseId} onNavigate={navigate} />;
    }

    // Instructor Course Edit Match: /instructor/courses/:id/edit
    if (currentPath.startsWith('/instructor/courses/') && currentPath.endsWith('/edit')) {
      const rest = currentPath.replace('/instructor/courses/', '');
      const courseId = rest.replace('/edit', '');
      return (
        <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
          <InstructorCourseEditPage courseId={courseId} onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // Instructor Detail Match: /instructors/:id
    if (currentPath.startsWith('/instructors/') && currentPath !== '/instructors') {
      const instructorId = currentPath.replace('/instructors/', '');
      return <InstructorProfilePage instructorId={instructorId} onNavigate={navigate} />;
    }

    // Parse URL Search Parameters for Courses page
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category') || undefined;
    const searchParam = urlParams.get('q') || undefined;

    switch (currentPath) {
      // Public Routes
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/courses':
        return <CoursesPage onNavigate={navigate} initialCategoryId={categoryParam} initialSearch={searchParam} />;
      case '/categories':
        return <CategoriesPage onNavigate={navigate} />;
      case '/instructors':
        return <InstructorsPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage />;
      case '/pricing':
        return <PricingPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/faq':
        return <FAQPage onNavigate={navigate} />;
      case '/terms':
        return <TermsPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/register':
        return <RegisterPage onNavigate={navigate} />;
      case '/become-instructor':
        return <BecomeInstructorPage onNavigate={navigate} />;
      case '/forgot-password':
      case '/reset-password':
        return <ForgotPasswordPage onNavigate={navigate} />;

      // Student Routes
      case '/student/dashboard':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentDashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/courses':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <MyCoursesPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/progress':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentProgressPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/wishlist':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentWishlistPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/reviews':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentReviewsPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/profile':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentProfilePage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/student/settings':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <StudentSettingsPage />
          </ProtectedRoute>
        );
      case '/student/notifications':
        return (
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} onNavigate={navigate}>
            <StudentNotificationsPage onNavigate={navigate} />
          </ProtectedRoute>
        );

      // Instructor Routes
      case '/instructor/dashboard':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorDashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/courses':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorCoursesPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/courses/create':
      case '/instructor/courses/new':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorCourseCreatePage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/students':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorStudentsPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/analytics':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorAnalyticsPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/reviews':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorReviewsPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/profile':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorSelfProfilePage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/instructor/settings':
        return (
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} onNavigate={navigate}>
            <InstructorSettingsPage onNavigate={navigate} />
          </ProtectedRoute>
        );

      // Admin Routes
      case '/admin/dashboard':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminDashboardPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/admin/users':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminUsersPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/admin/students':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminStudentsPage />
          </ProtectedRoute>
        );
      case '/admin/instructors':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminInstructorsPage />
          </ProtectedRoute>
        );
      case '/admin/courses':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminCoursesPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/admin/categories':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminCategoriesPage />
          </ProtectedRoute>
        );
      case '/admin/enrollments':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminEnrollmentsPage />
          </ProtectedRoute>
        );
      case '/admin/reviews':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminReviewsPage />
          </ProtectedRoute>
        );
      case '/admin/reports':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminReportsPage />
          </ProtectedRoute>
        );
      case '/admin/notifications':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminNotificationsPage />
          </ProtectedRoute>
        );
      case '/admin/audit-logs':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminAuditLogsPage />
          </ProtectedRoute>
        );
      case '/admin/settings':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
            <AdminSettingsPage />
          </ProtectedRoute>
        );

      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  // 1. Full-screen distraction-free video learning interface
  if (isLearningPage) {
    return <>{renderRoute()}</>;
  }

  // 2. Private Instructor Studio Application Shell
  if (currentPath.startsWith('/instructor')) {
    return (
      <InstructorLayout currentPath={currentPath} onNavigate={navigate}>
        {renderRoute()}
      </InstructorLayout>
    );
  }

  // 3. Private Student Portal Application Shell
  if (currentPath.startsWith('/student')) {
    return (
      <StudentLayout currentPath={currentPath} onNavigate={navigate}>
        {renderRoute()}
      </StudentLayout>
    );
  }

  // 4. Private Admin Governance Application Shell
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigate}>
        {renderRoute()}
      </AdminLayout>
    );
  }

  // 5. Public Website Shell (with Public Header, Public Content, Public Footer, NO sidebars)
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onNavigate={navigate} currentPath={currentPath} />
      <main className="flex-1">{renderRoute()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
