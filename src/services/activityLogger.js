import {
  addDocToCollection,
  getCollection,
} from '../firebase/firestoreService';
import { COLLECTIONS } from '../utils/constants';

export async function logActivity(userId, action, module, details = '') {
  try {
    await addDocToCollection(COLLECTIONS.ACTIVITY_LOGS, {
      userId,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivities(limitCount = 20) {
  try {
    const activities = await getCollection(COLLECTIONS.ACTIVITY_LOGS, {
      orderField: 'createdAt',
      orderDirection: 'desc',
      limitCount,
    });
    return activities;
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    throw error;
  }
}
