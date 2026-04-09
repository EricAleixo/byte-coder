import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, notInArray } from "drizzle-orm";
import { db } from "../../database";
import { NewPostImage, postImages } from "../../database/schemas";

@Injectable()
export class PostImagesRepository {

  findByPost(postId: string) {
    return db
      .select()
      .from(postImages)
      .where(eq(postImages.postId, postId));
  }

  insertMany(rows: NewPostImage[]) {
    if (!rows.length) return [];
    return db.insert(postImages).values(rows).returning();
  }

  // deleta imagens que sumiram do conteúdo
  deleteOrphansForPost(postId: string, keepPublicIds: string[]) {
    if (keepPublicIds.length === 0) {
      return db
        .delete(postImages)
        .where(eq(postImages.postId, postId))
        .returning();
    }
    return db
      .delete(postImages)
      .where(
        eq(postImages.postId, postId) &&
        notInArray(postImages.publicId, keepPublicIds),
      )
      .returning();
  }

  deleteAllByPost(postId: string) {
    return db
      .delete(postImages)
      .where(eq(postImages.postId, postId))
      .returning();
  }
}