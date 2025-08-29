export interface DocumentData {
  [key: string]: string;
}

export interface LegalAdvice {
  recommendation: string;
  options: string[];
  estimatedCost: string;
  timeFrame: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Mediation {
  id: string;
  caseId: string;
  initiatorId: string;
  mediatorId: string;
  reason: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scheduledDate?: Date;
  location?: string;
  notes?: string;
  sessionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest {
  user: {
    userId: string;
    role: string;
  };
}
