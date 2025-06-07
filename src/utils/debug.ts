import { sanitizeText } from './security';

export function debugLocalStorage() {
  try {
    const legacyData = localStorage.getItem('kanban-tasks');
    if (legacyData) {
      console.log('Legacy data found:', sanitizeText(legacyData));
      try {
        const parsed = JSON.parse(legacyData);
        console.log('Parsed legacy data:', parsed);
      } catch (e) {
        console.error('Failed to parse legacy data:', e);
      }
    } else {
      console.log('No legacy data found in localStorage');
    }

    // Check other related keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('task-store:', localStorage.getItem('task-store'));
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
}