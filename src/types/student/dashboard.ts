export interface DashboardAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: string;
  published_at?: string;
  expired_at?: string;
  is_pinned?: boolean;
  course_id?: {
    _id?: string;
    title?: string;
  };
}

export interface DashboardAssignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  course_id?: {
    _id?: string;
    title?: string;
  };
}
