import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  serverTimestamp,
  increment,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';

function getCollectionRef(collectionName) {
  return collection(db, collectionName);
}

function getDocRef(collectionName, docId) {
  return doc(db, collectionName, docId);
}

export async function getCollection(collectionName, options = {}) {
  const {
    filters = [],
    orderField = null,
    orderDirection = 'asc',
    limitCount = null,
    startAfterDoc = null,
  } = options;

  let q = query(getCollectionRef(collectionName));

  for (const filter of filters) {
    const { field, operator = '==', value } = filter;
    q = query(q, where(field, operator, value));
  }

  if (orderField) {
    q = query(q, orderBy(orderField, orderDirection));
  }

  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }

  if (limitCount) {
    q = query(q, firestoreLimit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function getCollectionCount(collectionName, filters = []) {
  let q = query(getCollectionRef(collectionName));

  for (const filter of filters) {
    const { field, operator = '==', value } = filter;
    q = query(q, where(field, operator, value));
  }

  // Use getCountFromServer — avoids downloading all documents just to count
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function addDocToCollection(collectionName, data) {
  const docRef = await addDoc(getCollectionRef(collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getDocFromCollection(collectionName, docId) {
  const docSnap = await getDoc(getDocRef(collectionName, docId));
  if (!docSnap.exists()) {
    return null;
  }
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateDocInCollection(collectionName, docId, data) {
  await updateDoc(getDocRef(collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocFromCollection(collectionName, docId) {
  await deleteDoc(getDocRef(collectionName, docId));
}

export function buildQuery(collectionName, options = {}) {
  const {
    filters = [],
    orderField = null,
    orderDirection = 'asc',
    limitCount = null,
  } = options;

  let q = query(getCollectionRef(collectionName));

  for (const filter of filters) {
    const { field, operator = '==', value } = filter;
    q = query(q, where(field, operator, value));
  }

  if (orderField) {
    q = query(q, orderBy(orderField, orderDirection));
  }

  if (limitCount) {
    q = query(q, firestoreLimit(limitCount));
  }

  return q;
}

const usersService = {
  add: (data) => addDocToCollection('users', data),
  getAll: (options) => getCollection('users', options),
  getById: (id) => getDocFromCollection('users', id),
  update: (id, data) => updateDocInCollection('users', id, data),
  delete: (id) => deleteDocFromCollection('users', id),
  count: (filters) => getCollectionCount('users', filters),
};

const farmersService = {
  add: (data) => addDocToCollection('farmers', data),
  getAll: (options) => getCollection('farmers', options),
  getById: (id) => getDocFromCollection('farmers', id),
  update: (id, data) => updateDocInCollection('farmers', id, data),
  delete: (id) => deleteDocFromCollection('farmers', id),
  count: (filters) => getCollectionCount('farmers', filters),
};

const employeesService = {
  add: (data) => addDocToCollection('employees', data),
  getAll: (options) => getCollection('employees', options),
  getById: (id) => getDocFromCollection('employees', id),
  update: (id, data) => updateDocInCollection('employees', id, data),
  delete: (id) => deleteDocFromCollection('employees', id),
  count: (filters) => getCollectionCount('employees', filters),
};

const coffeeCollectionsService = {
  add: (data) => addDocToCollection('coffeeCollections', data),
  getAll: (options) => getCollection('coffeeCollections', options),
  getById: (id) => getDocFromCollection('coffeeCollections', id),
  update: (id, data) => updateDocInCollection('coffeeCollections', id, data),
  delete: (id) => deleteDocFromCollection('coffeeCollections', id),
  count: (filters) => getCollectionCount('coffeeCollections', filters),
};

const productionService = {
  add: (data) => addDocToCollection('production', data),
  getAll: (options) => getCollection('production', options),
  getById: (id) => getDocFromCollection('production', id),
  update: (id, data) => updateDocInCollection('production', id, data),
  delete: (id) => deleteDocFromCollection('production', id),
  count: (filters) => getCollectionCount('production', filters),
};

const inventoryService = {
  add: (data) => addDocToCollection('inventory', data),
  getAll: (options) => getCollection('inventory', options),
  getById: (id) => getDocFromCollection('inventory', id),
  update: (id, data) => updateDocInCollection('inventory', id, data),
  delete: (id) => deleteDocFromCollection('inventory', id),
  count: (filters) => getCollectionCount('inventory', filters),
};

const customersService = {
  add: (data) => addDocToCollection('customers', data),
  getAll: (options) => getCollection('customers', options),
  getById: (id) => getDocFromCollection('customers', id),
  update: (id, data) => updateDocInCollection('customers', id, data),
  delete: (id) => deleteDocFromCollection('customers', id),
  count: (filters) => getCollectionCount('customers', filters),
};

const salesService = {
  add: (data) => addDocToCollection('sales', data),
  getAll: (options) => getCollection('sales', options),
  getById: (id) => getDocFromCollection('sales', id),
  update: (id, data) => updateDocInCollection('sales', id, data),
  delete: (id) => deleteDocFromCollection('sales', id),
  count: (filters) => getCollectionCount('sales', filters),
};

const expensesService = {
  add: (data) => addDocToCollection('expenses', data),
  getAll: (options) => getCollection('expenses', options),
  getById: (id) => getDocFromCollection('expenses', id),
  update: (id, data) => updateDocInCollection('expenses', id, data),
  delete: (id) => deleteDocFromCollection('expenses', id),
  count: (filters) => getCollectionCount('expenses', filters),
};

const departmentsService = {
  add: (data) => addDocToCollection('departments', data),
  getAll: (options) => getCollection('departments', options),
  getById: (id) => getDocFromCollection('departments', id),
  update: (id, data) => updateDocInCollection('departments', id, data),
  delete: (id) => deleteDocFromCollection('departments', id),
  count: (filters) => getCollectionCount('departments', filters),
};

const settingsService = {
  add: (data) => addDocToCollection('settings', data),
  getAll: (options) => getCollection('settings', options),
  getById: (id) => getDocFromCollection('settings', id),
  update: (id, data) => updateDocInCollection('settings', id, data),
  delete: (id) => deleteDocFromCollection('settings', id),
  count: (filters) => getCollectionCount('settings', filters),
};

const activityLogsService = {
  add: (data) => addDocToCollection('activityLogs', data),
  getAll: (options) => getCollection('activityLogs', options),
  getById: (id) => getDocFromCollection('activityLogs', id),
  update: (id, data) => updateDocInCollection('activityLogs', id, data),
  delete: (id) => deleteDocFromCollection('activityLogs', id),
  count: (filters) => getCollectionCount('activityLogs', filters),
};

const paymentsService = {
  add: (data) => addDocToCollection('payments', data),
  getAll: (options) => getCollection('payments', options),
  getById: (id) => getDocFromCollection('payments', id),
  update: (id, data) => updateDocInCollection('payments', id, data),
  delete: (id) => deleteDocFromCollection('payments', id),
  count: (filters) => getCollectionCount('payments', filters),
};

const notificationsService = {
  add: (data) => addDocToCollection('notifications', data),
  getAll: (options) => getCollection('notifications', options),
  getById: (id) => getDocFromCollection('notifications', id),
  update: (id, data) => updateDocInCollection('notifications', id, data),
  delete: (id) => deleteDocFromCollection('notifications', id),
  count: (filters) => getCollectionCount('notifications', filters),
};

const contactMessagesService = {
  add: (data) => addDocToCollection('contact_messages', data),
  getAll: (options) => getCollection('contact_messages', options),
  getById: (id) => getDocFromCollection('contact_messages', id),
  update: (id, data) => updateDocInCollection('contact_messages', id, data),
  delete: (id) => deleteDocFromCollection('contact_messages', id),
  count: (filters) => getCollectionCount('contact_messages', filters),
};

export {
  usersService,
  farmersService,
  employeesService,
  coffeeCollectionsService,
  productionService,
  inventoryService,
  customersService,
  salesService,
  expensesService,
  paymentsService,
  notificationsService,
  departmentsService,
  settingsService,
  activityLogsService,
  contactMessagesService,
};
