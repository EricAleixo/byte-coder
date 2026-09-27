import { Injectable } from "@nestjs/common";
import { db } from "../../database";
import { courseResources, NewCourseResource } from "../../database/schemas";

@Injectable()
export class CourseResourcesRepository {
    
  async addResource(resource: NewCourseResource) {
    const result = await db.insert(courseResources)
        .values(resource)
        .returning();

    return result[0];
  }
  
}