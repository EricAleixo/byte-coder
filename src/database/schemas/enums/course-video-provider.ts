import { pgEnum } from "drizzle-orm/pg-core";

export const courseVideoProviderEnum = pgEnum("course_video_provider", [
  "YOUTUBE",
  "VIMEO",
  "DIRECT", // mp4 hospedado direto, sem embed de terceiro
]);