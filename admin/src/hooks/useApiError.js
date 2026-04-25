/**
 * Utility to extract a structured error from an Axios error response.
 *
 * The backend always returns:
 *   { success, message, errorCode, errors?: [{field, message}], field?: string }
 *
 * Usage in a component:
 *   import { parseApiError, getFieldError } from "@/hooks/useApiError";
 *
 *   const { message, errors, errorCode } = parseApiError(err);
 *   const nameError = getFieldError(errors, "name");
 */

/**
 * Parse an Axios error into a structured object.
 * @param {any} error - The caught error from an axios call.
 * @returns {{ message: string, errorCode: string|null, errors: Array, field: string|null }}
 */
export function parseApiError(error) {
  const data = error?.response?.data;
  return {
    message: data?.message || error?.message || "Something went wrong",
    errorCode: data?.errorCode || null,
    errors: Array.isArray(data?.errors) ? data.errors : [],
    field: data?.field || null,
  };
}

/**
 * Get the first error message for a specific field from the errors array.
 * @param {Array} errors - The errors array from parseApiError.
 * @param {string} fieldName - The field name to look up.
 * @returns {string|null}
 */
export function getFieldError(errors, fieldName) {
  if (!Array.isArray(errors)) return null;
  const found = errors.find((e) => e.field === fieldName);
  return found?.message || null;
}

/**
 * Build a field-error map from the errors array.
 * e.g. { name: "name is required", email: "email must be a valid email" }
 * @param {Array} errors
 * @returns {Record<string, string>}
 */
export function buildFieldErrors(errors) {
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, err) => {
    if (err.field) acc[err.field] = err.message;
    return acc;
  }, {});
}
