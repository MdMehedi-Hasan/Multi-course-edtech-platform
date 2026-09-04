import { Role, CourseLevel } from '@prisma/client';
import { prisma } from '../server/db/prisma.js';
import bcrypt from 'bcryptjs';


export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // Hash standard demo passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users & Profiles
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@ednexus.edu' },
    update: {},
    create: {
      email: 'student@ednexus.edu',
      passwordHash,
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          name: 'Alex Johnson',
          headline: 'Lifelong Learner & Graduate Student',
          bio: 'Passionate about business strategy, digital marketing, and modern technologies.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          github: 'alexjohnson',
          linkedin: 'alexjohnson-student',
        },
      },
    },
  });

  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@ednexus.edu' },
    update: {},
    create: {
      email: 'instructor@ednexus.edu',
      passwordHash,
      role: Role.INSTRUCTOR,
      isVerified: true,
      profile: {
        create: {
          name: 'Dr. Sarah Vance',
          headline: 'Executive Leadership Coach & Senior Educator',
          bio: '15+ years advising international businesses and designing executive development programs. Course author and keynote speaker.',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
          website: 'https://sarahvance.edu',
          linkedin: 'sarahvance',
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ednexus.edu' },
    update: {},
    create: {
      email: 'admin@ednexus.edu',
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          name: 'Marcus Vance',
          headline: 'Platform Operations Director',
          bio: 'Managing platform governance, curriculum standards, and instructor onboarding.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        },
      },
    },
  });

  // 2. Create Categories
  const catBusiness = await prisma.category.upsert({
    where: { slug: 'business-management' },
    update: {},
    create: {
      name: 'Business & Management',
      slug: 'business-management',
      description: 'Strategic leadership, financial intelligence, project management, and entrepreneurship.',
      iconName: 'Briefcase',
    },
  });

  const catMarketing = await prisma.category.upsert({
    where: { slug: 'digital-marketing' },
    update: {},
    create: {
      name: 'Digital Marketing & Growth',
      slug: 'digital-marketing',
      description: 'SEO mastery, content strategy, brand building, and multi-channel campaign analytics.',
      iconName: 'TrendingUp',
    },
  });

  const catDesign = await prisma.category.upsert({
    where: { slug: 'design-creative' },
    update: {},
    create: {
      name: 'Design & Creative Arts',
      slug: 'design-creative',
      description: 'UI/UX design, visual identity, digital illustration, and creative brand direction.',
      iconName: 'Palette',
    },
  });

  const catTech = await prisma.category.upsert({
    where: { slug: 'technology-programming' },
    update: {},
    create: {
      name: 'Technology & Programming',
      slug: 'technology-programming',
      description: 'Modern software engineering, web development, and cloud architecture.',
      iconName: 'Code',
    },
  });

  // 3. Create Courses with Sections & Lessons
  const course1 = await prisma.course.upsert({
    where: { slug: 'executive-leadership-strategic-decision-making' },
    update: {},
    create: {
      title: 'Executive Leadership & Strategic Decision Making',
      slug: 'executive-leadership-strategic-decision-making',
      shortDescription: 'Master organizational strategy, team alignment, crisis navigation, and high-stakes decision frameworks.',
      description: 'An executive-level masterclass for aspiring managers, team leaders, and founders. Learn practical methodologies to lead high-performing cross-functional teams, formulate data-backed strategic roadmaps, and negotiate successfully.',
      price: 79.99,
      level: CourseLevel.INTERMEDIATE,
      isPublished: true,
      instructorId: instructorUser.id,
      categoryId: catBusiness.id,
      sections: {
        create: [
          {
            title: 'Section 1: Strategic Vision Alignment & Goal Setting',
            orderIndex: 0,
            lessons: {
              create: [
                {
                  title: '1. Course Overview & Strategic Vision Alignment',
                  durationMinutes: 12,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  isFreePreview: true,
                  orderIndex: 0,
                },
                {
                  title: '2. Analytical Frameworks for Complex Decision Making',
                  durationMinutes: 18,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                  isFreePreview: false,
                  orderIndex: 1,
                },
              ],
            },
          },
          {
            title: 'Section 2: High-Performance Team Dynamics',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: '3. Leading Through Change & Organizational Culture',
                  durationMinutes: 22,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  isFreePreview: false,
                  orderIndex: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'growth-marketing-campaign-strategy' },
    update: {},
    create: {
      title: 'Growth Marketing & Multi-Channel Campaign Strategy',
      slug: 'growth-marketing-campaign-strategy',
      shortDescription: 'Execute data-driven organic and paid acquisition strategies that scale revenue sustainably.',
      description: 'Unlock modern marketing playbooks used by leading brands. Discover the full customer journey lifecycle, master performance marketing channels, and optimize conversion funnels.',
      price: 59.99,
      level: CourseLevel.BEGINNER,
      isPublished: true,
      instructorId: instructorUser.id,
      categoryId: catMarketing.id,
      sections: {
        create: [
          {
            title: 'Section 1: Acquisition Channels & Funnel Architecture',
            orderIndex: 0,
            lessons: {
              create: [
                {
                  title: '1. Modern Marketing Funnels & Customer Psychology',
                  durationMinutes: 15,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                  isFreePreview: true,
                  orderIndex: 0,
                },
                {
                  title: '2. Organic Search, Content Loops, and Channel Fit',
                  durationMinutes: 25,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                  isFreePreview: false,
                  orderIndex: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.course.upsert({
    where: { slug: 'javascript-bangla-tutorial-beginner-to-dom' },
    update: {},
    create: {
      title: 'JavaScript Bangla Tutorial: Beginner to DOM',
      slug: 'javascript-bangla-tutorial-beginner-to-dom',
      shortDescription: 'A structured Bengali-friendly JavaScript journey from first principles to interactive browser projects.',
      description: 'Build a strong JavaScript foundation through a practical sequence covering syntax, control flow, functions, arrays, objects, the browser DOM, events, and a final interactive project. This course follows the progression of the referenced JavaScript tutorial playlist while using original lesson structure and explanations.',
      thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb1CB1OGY89pb3x08iKI8Z-exLhUyzNTrYzBdFuaSIaA&s',
      price: 0,
      level: CourseLevel.BEGINNER,
      isPublished: true,
      instructorId: instructorUser.id,
      categoryId: catTech.id,
      sections: {
        create: [
          {
            title: 'Section 1: JavaScript Foundations',
            orderIndex: 0,
            lessons: {
              create: [
                { title: '1. What JavaScript Does in the Browser', durationMinutes: 12, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', isFreePreview: true, orderIndex: 0 },
                { title: '2. Adding JavaScript to an HTML Page', durationMinutes: 14, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', orderIndex: 1 },
                { title: '3. Variables, Values, and Data Types', durationMinutes: 18, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Section 2: Operators and Control Flow',
            orderIndex: 1,
            lessons: {
              create: [
                { title: '4. Operators and Expressions', durationMinutes: 16, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', orderIndex: 0 },
                { title: '5. Conditions with if, else, and switch', durationMinutes: 20, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', orderIndex: 1 },
                { title: '6. Repeating Work with Loops', durationMinutes: 22, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Section 3: Functions and Reusable Logic',
            orderIndex: 2,
            lessons: {
              create: [
                { title: '7. Writing and Calling Functions', durationMinutes: 19, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', orderIndex: 0 },
                { title: '8. Parameters, Return Values, and Scope', durationMinutes: 21, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', orderIndex: 1 },
                { title: '9. Arrow Functions and Modern Syntax', durationMinutes: 17, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Section 4: Arrays and Objects',
            orderIndex: 3,
            lessons: {
              create: [
                { title: '10. Arrays and Indexed Collections', durationMinutes: 20, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', orderIndex: 0 },
                { title: '11. Array Methods for Everyday Problems', durationMinutes: 24, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', orderIndex: 1 },
                { title: '12. Objects, Properties, and Nested Data', durationMinutes: 23, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Section 5: DOM and Browser Interaction',
            orderIndex: 4,
            lessons: {
              create: [
                { title: '13. Understanding the DOM Tree', durationMinutes: 18, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', orderIndex: 0 },
                { title: '14. Selecting and Updating Elements', durationMinutes: 22, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', orderIndex: 1 },
                { title: '15. Events, Forms, and User Input', durationMinutes: 25, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Section 6: Capstone Project',
            orderIndex: 5,
            lessons: {
              create: [
                { title: '16. Plan a Browser-Based To-Do App', durationMinutes: 15, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', orderIndex: 0 },
                { title: '17. Build the Interactive Features', durationMinutes: 28, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', orderIndex: 1 },
                { title: '18. Review, Debug, and Extend the Project', durationMinutes: 20, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const javascriptLessonVideoIds = [
    'rePN-VFo1Eo', 'lb7wT1gVU7Y', 'PHy8h0BixKA', 'vXHefJiJM24', 'xWujZw0yIqg', 'bH-xZqvPk8A',
    '5WXXBGjmsiA', 'HS6nkKeuP_M', 'DZHb10fzbOQ', 'UzPsbiJjqsA', 'ZwzOEK8KTWY', '55qObA3f9lw',
    'o-wx8CJ8W2g', 'WWhlEWOf2ww', 'TUl3pl5ODcU', 'AQwWeKrdB58', 'Po7yLhlBudg', 'KobnEBz0zs4',
  ];
  const javascriptLessons = await prisma.lesson.findMany({
    where: { section: { course: { slug: 'javascript-bangla-tutorial-beginner-to-dom' } } },
    orderBy: [{ section: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
  });
  await Promise.all(
    javascriptLessons.slice(0, javascriptLessonVideoIds.length).map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { externalUrl: `https://www.youtube.com/watch?v=${javascriptLessonVideoIds[index]}` },
      })
    )
  );

  // 4. Enroll Student in Course 1
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: studentUser.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      userId: studentUser.id,
      courseId: course1.id,
      progress: 33.3,
    },
  });

  console.log('✅ Database seeded successfully!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
