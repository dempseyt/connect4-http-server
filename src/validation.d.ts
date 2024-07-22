export type ValidationResult = {
  isValid: boolean;
  errors?: Array<{ message: string; path: string }>;
};
