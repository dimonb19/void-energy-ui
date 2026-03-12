type BoundaryErrorCode =
  | 'invalid_json'
  | 'invalid_shape'
  | 'network'
  | 'http_error'
  | 'preference_mismatch';

interface BoundaryError {
  code: BoundaryErrorCode;
  source: string;
  message: string;
  issues?: string[];
  status?: number;
}
