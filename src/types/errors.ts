/**
 * Error type for filesystem operations.
 * Covers common failure modes when reading/writing workspace files.
 */
export type FilesystemError = {
  code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'DISK_FULL' | 'UNKNOWN';
  message: string;
  path: string;
};

/**
 * Error type for AI service operations via Ollama.
 * Covers connectivity and generation failures.
 */
export type AIError = {
  code: 'OLLAMA_UNREACHABLE' | 'GENERATION_FAILED' | 'TIMEOUT';
  message: string;
};

/**
 * Error type for Git operations.
 * Covers initialization and commit/add failures.
 */
export type GitError = {
  code: 'NOT_INITIALIZED' | 'COMMIT_FAILED' | 'ADD_FAILED';
  message: string;
  filePath: string;
};
