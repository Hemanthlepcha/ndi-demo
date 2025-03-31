/**
 * Generates a unique thread ID
 * @returns {string} A unique thread ID
 */
export function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates if a given thread ID is valid
 * @param {string} threadId - The thread ID to validate
 * @returns {boolean} Whether the thread ID is valid
 */
export function isValidThreadId(threadId) {
  return threadId && typeof threadId === 'string' && threadId.startsWith('thread_');
} 