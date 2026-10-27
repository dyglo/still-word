// Mock data. Replace with queries on posts / post_events / visitors.
export const stats = [
  { label: "Visitors joined", value: "12,480", note: "+8.2% vs prior 14 days", up: true },
  { label: "Total views", value: "48,310", note: "+5.1% vs prior 14 days", up: true },
  { label: "Completed reads", value: "21,902", note: "45% of views" },
  { label: "Published posts", value: "24", note: "3 drafts" },
];
export const visitorsPerDay = [90, 110, 100, 130, 120, 95, 140, 160, 150, 135, 170, 155, 180, 165];
export const topPosts = [
  { title: "The Case for Slow Reading", views: 6420, reads: 3190 },
  { title: "Notes on Quiet Interfaces", views: 5180, reads: 2540 },
  { title: "Why We Still Write Letters", views: 4260, reads: 2310 },
  { title: "A Small Theory of Margins", views: 3870, reads: 1610 },
  { title: "Typography Is Tone", views: 2940, reads: 1480 },
];
export const drafts = [
  { title: "The Case for Slow Reading", edited: "Edited 2 hours ago" },
  { title: "On Reading Aloud", edited: "Edited yesterday" },
  { title: "Untitled", edited: "Edited 3 days ago" },
];
