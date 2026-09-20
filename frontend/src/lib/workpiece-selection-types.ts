// Catalog display states used by the browser; engineering decisions come from the backend.
export type WorkpieceDisplayState =
  | 'industry_direction'
  | 'conditional_directions'
  | 'insufficient_inputs'
  | 'special_process'
  | 'outside_module'
  | 'engineering_review'
  | 'unverified';
