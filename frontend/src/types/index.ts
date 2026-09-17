export interface ValidationIssue {
  id?: string;
  issue_type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  resolved: boolean;
}

export interface PossibleDuplicate {
  id: string;
  title: string;
  location?: string | null;
  date?: string | null;
  organizer?: string | null;
  similarity_score: number;
  reason: string;
}

export interface ConflictingInfo {
  field: string;
  source_a_val: string;
  source_b_val: string;
  message: string;
}

export interface ConfidenceBreakdownItem {
  factor: string;
  points: number;
  max_points: number;
  passed: boolean;
}

export interface ConfidenceDetail {
  total_score: number;
  label: 'High' | 'Medium' | 'Low' | string;
  breakdown: ConfidenceBreakdownItem[];
}

export interface Experience {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  price: string | null;
  currency: string | null;
  category: string | null;
  organizer: string | null;
  source_url: string;
  source_name: string | null;
  
  relevance_score: number;
  relevance_reason: string | null;
  is_relevant: boolean;
  confidence_score: number;
  confidence_label: string;
  status: 'needs_review' | 'approved' | 'rejected' | string;
  is_demo: boolean;
  
  created_at: string;
  updated_at: string;
  
  validation_issues: ValidationIssue[];
  possible_duplicates: PossibleDuplicate[];
  conflicting_info: ConflictingInfo[];
  confidence_detail?: ConfidenceDetail | null;
}

export interface DashboardStats {
  total_discovered: number;
  pending_review: number;
  approved: number;
  rejected: number;
  low_confidence: number;
}

export interface ExperienceListResponse {
  items: Experience[];
  total: number;
}

export interface AnalyzeRequest {
  url: string;
  is_demo?: boolean;
  demo_template_id?: string;
}
