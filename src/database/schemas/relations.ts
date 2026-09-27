import { relations } from 'drizzle-orm';
import { posts } from './post.schema';
import { categories } from './category.schema';
import { tags } from './tag.schema';
import { postTags } from './post-tags.schema';
import { users } from './user.schema';
import { comments } from './comments.schema';
import { postImages } from './post-image.schema';
import { courseResources } from './course-resources.schema';
import { courses } from './course.schema';
import { courseOutcomes } from './course-outcomes.schema';
import { courseLessons } from './course-lessons.schema';
import { courseLessonResources } from './course-lessons-resources.schema';

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
  images: many(postImages),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, { relationName: 'replies' }),
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  author: one(users, {
    fields: [courses.authorId],
    references: [users.id],
  }),
  lessons: many(courseLessons),
  resources: many(courseResources),
  outcomes: many(courseOutcomes),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseLessons.courseId],
    references: [courses.id],
  }),
  resources: many(courseLessonResources),
}));

export const courseResourcesRelations = relations(
  courseResources,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseResources.courseId],
      references: [courses.id],
    }),
  }),
);

export const courseOutcomesRelations = relations(courseOutcomes, ({ one }) => ({
  course: one(courses, {
    fields: [courseOutcomes.courseId],
    references: [courses.id],
  }),
}));

export const courseLessonResourcesRelations = relations(courseLessonResources, ({ one }) => ({
  lesson: one(courseLessons, {
    fields: [courseLessonResources.lessonId],
    references: [courseLessons.id],
  }),
}));