import z from "zod";
import { VIKUNJA_BUCKET } from "../vikunja-bucket.schema";

export const TASK_UPDATED_SCHEMA = z.object({
  event_name: z.enum(["task.updated"]),
  data: z.object({
    task: z.object({
      id: z.number(),
      buckets: VIKUNJA_BUCKET.array().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      labels: z
        .object({
          title: z.string(),
        })
        .array(),
    }),
    project: z.object({
      title: z.string(),
    }),
  }),
});

export type TaskUpdatedEvent = z.infer<typeof TASK_UPDATED_SCHEMA>;

// const test = {
//   event_name: "task.updated",
//   time: "2026-04-09T15:23:59.219361196Z",
//   data: {
//     doer: {
//       id: 1,
//       name: "",
//       username: "root",
//       created: "2026-04-08T13:34:57Z",
//       updated: "2026-04-08T13:34:57Z",
//     },
//     project: {
//       id: 1,
//       title: "Ceraplus",
//       description: "",
//       identifier: "",
//       hex_color: "",
//       parent_project_id: 0,
//       owner: [Object ...],
//       is_archived: false,
//       background_information: null,
//       background_blur_hash: "",
//       is_favorite: false,
//       position: 65536,
//       views: [
//         [Object ...], [Object ...], [Object ...], [Object ...]
//       ],
//       max_permission: 0,
//       created: "2026-04-08T13:34:57Z",
//       updated: "2026-04-09T14:51:58Z",
//     },
//     task: {
//       id: 16,
//       title: "test",
//       description: "",
//       done: false,
//       done_at: "0001-01-01T00:00:00Z",
//       due_date: "0001-01-01T00:00:00Z",
//       reminders: null,
//       project_id: 1,
//       repeat_after: 0,
//       repeat_mode: 0,
//       priority: 0,
//       start_date: "0001-01-01T00:00:00Z",
//       end_date: "0001-01-01T00:00:00Z",
//       assignees: null,
//       labels: null,
//       hex_color: "",
//       percent_done: 0,
//       identifier: "#1",
//       index: 1,
//       related_tasks: [Object ...],
//       attachments: null,
//       cover_image_attachment_id: 0,
//       is_favorite: false,
//       created: "2026-04-09T14:48:33Z",
//       updated: "2026-04-09T14:51:58Z",
//       bucket_id: 0,
//       buckets: [
//         [Object ...]
//       ],
//       position: 0,
//       reactions: null,
//       created_by: [Object ...],
//     },
//   },
// }
