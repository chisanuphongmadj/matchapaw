import type { ValidationIssue } from "../types/api";

/** Error ที่ระบุ HTTP Status Code ได้ เพื่อให้ errorHandler ส่ง Response ที่เหมาะสม */
export class HttpError extends Error {
  readonly status: number;
  readonly details: ValidationIssue[] | undefined;

  constructor(status: number, message: string, details?: ValidationIssue[]) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}
