export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MATCHING = 'MATCHING',
  ORDERING = 'ORDERING',
  FILL_BLANKS = 'FILL_BLANKS',
  NUMERIC = 'NUMERIC',
  // FILE_UPLOAD = 'FILE_UPLOAD',
  // HOTSPOT = 'HOTSPOT',
  // LIKERT_SCALE = 'LIKERT_SCALE',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum GradingMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  MIXED = 'MIXED',
}

export enum ReleaseMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum AttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  TIMED_OUT = 'TIMED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum SecurityEventType {
  QUIZ_STARTED = 'QUIZ_STARTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TAB_SWITCH = 'TAB_SWITCH',
  COPY_PASTE = 'COPY_PASTE',
  RIGHT_CLICK = 'RIGHT_CLICK',
  KEYBOARD_SHORTCUT = 'KEYBOARD_SHORTCUT',
  MULTIPLE_SESSIONS = 'MULTIPLE_SESSIONS',
  IP_CHANGE = 'IP_CHANGE',
  BROWSER_CHANGE = 'BROWSER_CHANGE',
  TIME_EXCEEDED = 'TIME_EXCEEDED',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  SUBMIT = 'SUBMIT',
  GRADE = 'GRADE',
  PUBLISH = 'PUBLISH',
  ARCHIVE = 'ARCHIVE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  ENROLL = 'ENROLL',
  DROP = 'DROP',
  INVITE = 'INVITE',
  ASSIGN = 'ASSIGN',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
  GENERATE = 'GENERATE',
  DOWNLOAD = 'DOWNLOAD',
  PASSWORD_RESET = 'PASSWORD_RESET',
  REVOKE = 'REVOKE',
}

export enum NotificationType {
  QUIZ_PUBLISHED = 'QUIZ_PUBLISHED',
  QUIZ_GRADED = 'QUIZ_GRADED',
  QUIZ_REMINDER = 'QUIZ_REMINDER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  GRADE_RELEASED = 'GRADE_RELEASED',
}
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  LECTURER = 'LECTURER',
  LEARNER = 'LEARNER',
  DATA_MANAGER = 'DATA_MANAGER',
  CONTENT_REVIEWER = 'CONTENT_REVIEWER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AssetType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  CERTIFICATE = 'CERTIFICATE',
}

export enum ModuleVisibility {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

export enum CourseVisibility {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum EnrollmentType {
  SELF_ENROLLMENT = 'SELF_ENROLLMENT',
  INVITE = 'INVITE',
  ASSIGNMENT = 'ASSIGNMENT',
  INSTITUTION = 'INSTITUTION',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  WAITLISTED = 'WAITLISTED',
  INVITED = 'INVITED',
  EXPIRED = 'EXPIRED',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum CourseStatus {
  HOT = 'HOT',
  NEW = 'NEW',
  SPECIAL = 'SPECIAL',
}

export enum CourseLanguage {
  EN = 'en',
  FR = 'fr',
  ES = 'es',
  DE = 'de',
  PT = 'pt',
}
export enum ContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  EMBED = 'EMBED',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  DISCUSSION = 'DISCUSSION',
  LIVE = 'LIVE',
  MEET = 'MEET',
}

export enum VideoSource {
  YOUTUBE = 'YOUTUBE',
  VIMEO = 'VIMEO',
}

export enum DocumentType {
  DOCX = 'DOCX',
  PDF = 'PDF',
  XLSX = 'XLSX',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
}

export enum FeedbackType {
  COMMENT = 'COMMENT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RESUBMIT = 'RESUBMIT',
}

export const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  ADVANCED_LEVEL = 'ADVANCED_LEVEL',
  DIPLOMA = 'DIPLOMA',
  BACHELORS = 'BACHELORS',
  MASTERS = 'MASTERS',
  PHD = 'PHD',
  PROFESSOR = 'PROFESSOR',
}

export enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  RESIDENT = 'RESIDENT',
  INTERN = 'INTERN',
  STUDENT = 'STUDENT',
  VOLUNTEER = 'VOLUNTEER',
}

export enum EmploymentSector {
  PUBLIC_SECTOR = 'PUBLIC_SECTOR',
  PRIVATE_SECTOR = 'PRIVATE_SECTOR',
  NGO = 'NGO',
}

export enum HealthcareInstitutionType {
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  UNIVERSITY = 'UNIVERSITY',
  NGO = 'NGO',
  TRAINING_INSTITUTION = 'TRAINING_INSTITUTION',
}
export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReminderChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

// Optional: Helper functions for display
export const MeetingStatusLabels: Record<MeetingStatus, string> = {
  [MeetingStatus.SCHEDULED]: 'Scheduled',
  [MeetingStatus.ONGOING]: 'Ongoing',
  [MeetingStatus.COMPLETED]: 'Completed',
  [MeetingStatus.CANCELLED]: 'Cancelled',
};

export const ReminderChannelLabels: Record<ReminderChannel, string> = {
  [ReminderChannel.EMAIL]: 'Email',
  [ReminderChannel.IN_APP]: 'In-App Notification',
};

// Optional: Color mappings for UI
export const MeetingStatusColors: Record<MeetingStatus, string> = {
  [MeetingStatus.SCHEDULED]: 'border-primary-muted bg-primary-subtle text-primary-hover',

  [MeetingStatus.ONGOING]: 'border-success/30 bg-success/10 text-success',

  [MeetingStatus.COMPLETED]: 'border-border bg-muted text-foreground-muted',

  [MeetingStatus.CANCELLED]: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export enum ReminderUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
}

export enum EmbedType {
  DOC = 'DOC',
  SHEET = 'SHEET',
  SLIDE = 'SLIDE',
  FORM = 'FORM',
}

export enum EmbedSource {
  GOOGLE = 'GOOGLE',
  NOTION = 'NOTION',
  FIGMA = 'FIGMA',
  CANVA = 'CANVA',
}

export enum DocumentOrientation {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

export enum CertificateElementType {
  // Basic elements
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SHAPE = 'SHAPE',

  // System elements
  CODE = 'CODE',
  QR_CODE = 'QR_CODE',
  DATE = 'DATE',

  // Student fields
  STUDENT_NAME = 'STUDENT_NAME',
  STUDENT_CODE = 'STUDENT_CODE',

  // Course fields
  COURSE_NAME = 'COURSE_NAME',
  COURSE_DETAILS = 'COURSE_DETAILS',
  COURSE_PROGRESS = 'COURSE_PROGRESS',
  COURSE_DURATION = 'COURSE_DURATION',
  COURSE_START_DATE = 'COURSE_START_DATE',
  COURSE_END_DATE = 'COURSE_END_DATE',

  // Instructor fields
  INSTRUCTOR_NAME = 'INSTRUCTOR_NAME',
  CO_INSTRUCTOR_NAME = 'CO_INSTRUCTOR_NAME',
}

export enum RatingValue {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
}

// Helper to convert shared enum to number score
export function ratingValueToNumber(value: RatingValue): number {
  switch (value) {
    case RatingValue.ONE:
      return 1;
    case RatingValue.TWO:
      return 2;
    case RatingValue.THREE:
      return 3;
    case RatingValue.FOUR:
      return 4;
    case RatingValue.FIVE:
      return 5;
  }
}

export const SpecialLessonType = {
  COURSE_COMPLETION: 'COURSE_COMPLETION',
} as const;

export enum LecturerApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum InstitutionalApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
