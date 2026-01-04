export interface ApiSuccessResponse<T> {
  status: true;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  detail?: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}