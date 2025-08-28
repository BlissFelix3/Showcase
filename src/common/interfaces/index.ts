// Document interfaces
export interface DocumentData {
  [key: string]: string;
}

// Chat interfaces
export interface LegalAdvice {
  recommendation: string;
  options: string[];
  estimatedCost: string;
  timeFrame: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Mediation interfaces
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

// User interfaces
export interface AuthenticatedRequest {
  user: {
    userId: string;
    role: string;
  };
}
