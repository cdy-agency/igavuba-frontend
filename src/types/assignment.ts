export interface IAssignmentInstruction {
  step: string;
  content: string;
}

export interface IAssignment {
  id: string;
  title: string;
  dueDate: string;
  availableAfter: string;
  points: number;
  submissionType: string;
  attempts: number;
  allowedAttempts: number;
  status: string;
  grade: string;
  gradedAnonymously: boolean;
  introduction: string;
  instructions: IAssignmentInstruction[];
  detailedInstructions: string;
  comments: string;
  type?: string;
  earnedPoints?: number;
  viewRubric?: boolean;
  submissionDetails?: string;
}
