import { supabase } from './config';

function toSnake(s) {
  return s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase());
}
function toCamel(s) {
  return s.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

const FIELD_ALIASES = {
  messages: { from: 'from_name', to: 'to_name' },
};
const FIELD_ALIASES_REVERSE = {
  messages: { from_name: 'from', to_name: 'to' },
};

function toSQLKeys(obj, table) {
  if (!obj || typeof obj !== 'object') return obj;
  const aliases = FIELD_ALIASES[table];
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      aliases?.[k] || (k === 'id' ? k : toSnake(k)),
      v,
    ])
  );
}

function toJSKeys(obj, table) {
  if (!obj || typeof obj !== 'object') return obj;
  const aliases = FIELD_ALIASES_REVERSE[table];
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      aliases?.[k] || (k === 'id' ? k : toCamel(k)),
      v,
    ])
  );
}

function toJSRows(rows, table) {
  if (!rows) return [];
  return rows.map((row) => {
    const converted = toJSKeys(row, table);
    return { id: converted.id, ...converted };
  });
}

const OPERATOR_MAP = {
  '==': 'eq',
  '!=': 'neq',
  '<': 'lt',
  '<=': 'lte',
  '>': 'gt',
  '>=': 'gte',
  in: 'in',
  'array-contains': 'contains',
};

export async function getCollection(collectionName, options = {}) {
  const {
    filters = [],
    orderField = null,
    orderDirection = 'asc',
    limitCount = null,
  } = options;

  let q = supabase.from(collectionName).select('*');

  for (const filter of filters) {
    const { field, operator = '==', value } = filter;
    const sqlOp = OPERATOR_MAP[operator] || 'eq';
    const sqlField = toSQLKeys({ [field]: null }, collectionName);
    const columnName = Object.keys(sqlField)[0];
    if (sqlOp === 'in') {
      q = q.in(columnName, Array.isArray(value) ? value : [value]);
    } else if (sqlOp === 'contains') {
      q = q.contains(columnName, value);
    } else {
      q = q.filter(columnName, sqlOp, value);
    }
  }

  if (orderField) {
    const col = toSQLKeys({ [orderField]: null }, collectionName);
    q = q.order(Object.keys(col)[0], { ascending: orderDirection === 'asc' });
  }

  if (limitCount) {
    q = q.limit(limitCount);
  }

  const { data, error } = await q;
  if (error) throw error;
  return toJSRows(data, collectionName);
}

export async function getCollectionCount(collectionName, filters = []) {
  let q = supabase.from(collectionName).select('id', { count: 'exact', head: true });

  for (const filter of filters) {
    const { field, operator = '==', value } = filter;
    const sqlOp = OPERATOR_MAP[operator] || 'eq';
    const sqlField = toSQLKeys({ [field]: null }, collectionName);
    const columnName = Object.keys(sqlField)[0];
    if (sqlOp === 'in') {
      q = q.in(columnName, Array.isArray(value) ? value : [value]);
    } else {
      q = q.filter(columnName, sqlOp, value);
    }
  }

  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
}

export async function addDocToCollection(collectionName, data) {
  const sqlData = toSQLKeys(data, collectionName);
  sqlData.created_at = sqlData.created_at || new Date().toISOString();
  sqlData.updated_at = sqlData.updated_at || new Date().toISOString();
  const { data: result, error } = await supabase
    .from(collectionName)
    .insert(sqlData)
    .select('id')
    .single();
  if (error) throw error;
  return result.id;
}

export async function getDocFromCollection(collectionName, docId) {
  const { data, error } = await supabase
    .from(collectionName)
    .select('*')
    .eq('id', docId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toJSKeys(data, collectionName);
}

export async function updateDocInCollection(collectionName, docId, data) {
  const sqlData = toSQLKeys(data, collectionName);
  delete sqlData.id;
  sqlData.updated_at = new Date().toISOString();
  const { error } = await supabase
    .from(collectionName)
    .update(sqlData)
    .eq('id', docId);
  if (error) throw error;
}

export async function deleteDocFromCollection(collectionName, docId) {
  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq('id', docId);
  if (error) throw error;
}

export function buildQuery(collectionName, options = {}) {
  return { collectionName, ...options };
}

const createService = (table) => ({
  add: (data) => addDocToCollection(table, data),
  getAll: (options) => getCollection(table, options),
  getById: (id) => getDocFromCollection(table, id),
  update: (id, data) => updateDocInCollection(table, id, data),
  delete: (id) => deleteDocFromCollection(table, id),
  count: (filters) => getCollectionCount(table, filters),
});

export const usersService = createService('users');
export const farmersService = createService('farmers');
export const employeesService = createService('employees');
export const coffeeCollectionsService = createService('coffee_collections');
export const productionService = createService('production');
export const inventoryService = createService('inventory');
export const customersService = createService('customers');
export const salesService = createService('sales');
export const expensesService = createService('expenses');
export const paymentsService = createService('payments');
export const notificationsService = createService('notifications');
export const departmentsService = createService('departments');
export const settingsService = createService('settings');
export const activityLogsService = createService('activity_logs');
export const contactMessagesService = createService('contact_messages');
