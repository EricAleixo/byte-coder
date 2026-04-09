import { Injectable } from "@nestjs/common";
import { PostImagesRepository } from "./post-images.repository";
import { UploadImageService } from "../upload-image/upload-image.service";

@Injectable()
export class PostImagesService {
  constructor(
    private readonly repo: PostImagesRepository,
    private readonly uploadService: UploadImageService,
  ) { }

  async sync(postId: string, htmlContent: string, newImages: { url: string; publicId: string }[]) {
    const currentIds = this.extractPublicIds(htmlContent);
    console.log("currentIds:", currentIds);

    const existing = await this.repo.findByPost(postId);
    console.log("existing:", existing);

    const existingIds = existing.map((i) => i.publicId);
    const toInsert = currentIds
      .filter((id) => !existingIds.includes(id))
      .map((publicId) => {
        const match = htmlContent.match(
          new RegExp(`src="([^"]+)"[^>]*data-public-id="${publicId.replace("/", "\\/")}"`),
        );
        return { postId, publicId, url: match?.[1] ?? "" };
      });

    console.log("toInsert:", toInsert);
    if (toInsert.length) {
      await this.repo.insertMany(toInsert);
    }

    const orphans = await this.repo.deleteOrphansForPost(postId, currentIds);
    console.log("orphans deletados:", orphans);
  }

  async deleteAll(postId: string) {
    const deleted = await this.repo.deleteAllByPost(postId);
    for (const img of deleted) {
      await this.uploadService.delete(img.publicId);
    }
  }

  private extractPublicIds(html: string): string[] {
    const matches = [...html.matchAll(/data-public-id="([^"]+)"/g)];
    console.log("IDs extraídos:", matches.map((m) => m[1]));
    return matches.map((m) => m[1]);
  }
}