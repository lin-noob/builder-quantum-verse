/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Language pack translation entry
 */
export interface LanguagePackEntry {
  keyCode: string;
  transform: string;
}

/**
 * Language pack response from API
 */
export interface LanguagePackResponse {
  success: boolean;
  data: LanguagePackEntry[];
  message?: string;
  code:string
}
