/** รูปแบบ Response มาตรฐานจาก Backend */

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiList<T> {
  data: T[];
  meta: { total: number };
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    message: string;
    details?: ValidationIssue[];
  };
}
