import { pgEnum } from 'drizzle-orm/pg-core';

export const courseResourceTypeEnum = pgEnum('course_resource_type', [
  'REPO',
  'DOC',
  'VIDEO',
  'ARTICLE',
]);
