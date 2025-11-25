/**
 * User Name Management Utility
 * Handles storing and retrieving user name from localStorage
 */

const USER_NAME_KEY = 'zaminat_user_name';
const FIRST_VISIT_KEY = 'zaminat_first_visit';
const DEFAULT_NAME = 'Suxrobjon Rixsiboyev';

export interface UserNameData {
  firstName: string;
  lastName: string;
  fullName: string;
}

/**
 * Get the user's name from localStorage or return default
 * SSR-safe: checks for window before accessing localStorage
 */
export function getUserName(): string {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return DEFAULT_NAME;
  }
  
  try {
    const stored = localStorage.getItem(USER_NAME_KEY);
    if (stored) {
      const data: UserNameData = JSON.parse(stored);
      return data.fullName || DEFAULT_NAME;
    }
  } catch (error) {
    // Silently fail and return default
  }
  return DEFAULT_NAME;
}

/**
 * Get the user's name data (firstName, lastName, fullName)
 * SSR-safe: checks for window before accessing localStorage
 */
export function getUserNameData(): UserNameData {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return {
      firstName: 'Suxrobjon',
      lastName: 'Rixsiboyev',
      fullName: DEFAULT_NAME
    };
  }
  
  try {
    const stored = localStorage.getItem(USER_NAME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    // Silently fail and return default
  }
  return {
    firstName: 'Suxrobjon',
    lastName: 'Rixsiboyev',
    fullName: DEFAULT_NAME
  };
}

/**
 * Save the user's name to localStorage
 * Only includes last name if it's provided
 * If only first name is provided, fullName will be just the first name
 * SSR-safe: checks for window before accessing localStorage
 */
export function saveUserName(firstName: string, lastName: string): void {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    // If both are empty, use default
    if (!trimmedFirstName && !trimmedLastName) {
      const data: UserNameData = {
        firstName: 'Suxrobjon',
        lastName: 'Rixsiboyev',
        fullName: DEFAULT_NAME
      };
      localStorage.setItem(USER_NAME_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: data }));
      return;
    }
    
    // Only include last name in fullName if it's provided
    // If only first name, fullName is just the first name (no space, no last name)
    const fullName = trimmedLastName 
      ? `${trimmedFirstName} ${trimmedLastName}`.trim()
      : trimmedFirstName; // Just first name, no default last name
    
    const data: UserNameData = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName
    };
    localStorage.setItem(USER_NAME_KEY, JSON.stringify(data));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: data }));
  } catch (error) {
    console.error('Failed to save user name:', error);
  }
}

/**
 * Check if this is the user's first visit
 * SSR-safe: checks for window before accessing localStorage
 */
export function isFirstVisit(): boolean {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return false; // Don't show modal during SSR/build
  }
  
  try {
    const visited = localStorage.getItem(FIRST_VISIT_KEY);
    return !visited;
  } catch (error) {
    return true; // Assume first visit if we can't check
  }
}

/**
 * Mark that the user has visited (welcome modal shown)
 * This prevents the modal from showing again on refresh
 * SSR-safe: checks for window before accessing localStorage
 */
export function markAsVisited(): void {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    // Also dispatch event to notify components
    window.dispatchEvent(new CustomEvent('welcomeModalCompleted'));
  } catch (error) {
    // Silently fail
  }
}

/**
 * Reset user name to default (for testing/debugging)
 * SSR-safe: checks for window before accessing localStorage
 */
export function resetUserName(): void {
  // Check if we're in a browser environment (not SSR/build)
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(USER_NAME_KEY);
    window.dispatchEvent(new CustomEvent('userNameUpdated', { 
      detail: {
        firstName: 'Suxrobjon',
        lastName: 'Rixsiboyev',
        fullName: DEFAULT_NAME
      }
    }));
  } catch (error) {
    // Silently fail
  }
}

