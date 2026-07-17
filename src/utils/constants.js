export const ROLES = {
  ADMIN: 'admin',
  FACTORY_MANAGER: 'factory_manager',
  COLLECTION_OFFICER: 'collection_officer',
  PRODUCTION_OFFICER: 'production_officer',
  STORE_KEEPER: 'store_keeper',
  ACCOUNTANT: 'accountant',
  FARMER: 'farmer',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.FACTORY_MANAGER]: 'Factory Manager',
  [ROLES.COLLECTION_OFFICER]: 'Collection Officer',
  [ROLES.PRODUCTION_OFFICER]: 'Production Officer',
  [ROLES.STORE_KEEPER]: 'Store Keeper',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.FARMER]: 'Farmer',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard', 'farmers', 'employees', 'collections', 'production',
    'inventory', 'payments', 'reports', 'settings', 'admin', 'messages',
  ],
  [ROLES.FACTORY_MANAGER]: [
    'dashboard', 'farmers', 'employees', 'collections', 'production',
    'inventory', 'payments', 'reports', 'settings', 'messages',
  ],
  [ROLES.COLLECTION_OFFICER]: [
    'dashboard', 'farmers', 'collections', 'messages',
  ],
  [ROLES.PRODUCTION_OFFICER]: [
    'dashboard', 'production', 'inventory', 'messages',
  ],
  [ROLES.STORE_KEEPER]: [
    'dashboard', 'inventory', 'messages',
  ],
  [ROLES.ACCOUNTANT]: [
    'dashboard', 'payments', 'reports', 'messages',
  ],
  [ROLES.FARMER]: [
    'dashboard', 'my_collections', 'settings', 'messages',
  ],
};

export const ROLE_REPORTS = {
  [ROLES.ADMIN]: ['collection', 'production', 'payment', 'inventory'],
  [ROLES.FACTORY_MANAGER]: ['collection', 'production', 'payment', 'inventory'],
  [ROLES.COLLECTION_OFFICER]: ['collection'],
  [ROLES.PRODUCTION_OFFICER]: ['production', 'inventory'],
  [ROLES.STORE_KEEPER]: ['inventory'],
  [ROLES.ACCOUNTANT]: ['payment'],
  [ROLES.FARMER]: ['collection', 'payment'],
};

export const ROLE_SETTINGS_TABS = {
  [ROLES.ADMIN]: ['profile', 'factory', 'departments', 'grades', 'centers', 'notifications'],
  [ROLES.FACTORY_MANAGER]: ['profile', 'factory', 'departments', 'grades', 'centers', 'notifications'],
  [ROLES.COLLECTION_OFFICER]: ['profile', 'notifications'],
  [ROLES.PRODUCTION_OFFICER]: ['profile', 'notifications'],
  [ROLES.STORE_KEEPER]: ['profile', 'notifications'],
  [ROLES.ACCOUNTANT]: ['profile', 'notifications'],
  [ROLES.FARMER]: ['profile', 'notifications'],
};

export const COLLECTIONS = {
  USERS: 'users',
  FARMERS: 'farmers',
  EMPLOYEES: 'employees',
  COFFEE_COLLECTIONS: 'coffeeCollections',
  PRODUCTION: 'production',
  INVENTORY: 'inventory',
  PAYMENTS: 'payments',
  DEPARTMENTS: 'departments',
  SETTINGS: 'settings',
  ACTIVITY_LOGS: 'activityLogs',
  NOTIFICATIONS: 'notifications',
};

export const COFFEE_GRADES = [
  'AA',
  'AB',
  'PB',
  'C',
  'TT',
  'T',
  'E',
  'FNGS',
  'BF',
  'BL',
  'HB',
  'HE',
  'SGH',
  'MH/ML',
];

export const EXPENSE_CATEGORIES = [
  'Labor',
  'Transport',
  'Fertilizers',
  'Pesticides',
  'Equipment',
  'Utilities',
  'Maintenance',
  'Packaging',
  'Raw Materials',
  'Administrative',
  'Marketing',
  'Rent',
  'Insurance',
  'Miscellaneous',
];

export const DEPARTMENTS = [
  'Management',
  'Collection',
  'Processing',
  'Quality Control',
  'Packing',
  'Warehouse',
  'Sales & Marketing',
  'Finance & Accounts',
  'Human Resources',
  'Maintenance',
  'Transport',
  'Security',
];

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  PAID: 'paid',
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  RECEIVED: 'received',
};

export const PROCESSING_STAGES = [
  'Received',
  'Washing',
  'Sorting',
  'Drying',
  'Milling',
  'Packaging',
  'Completed',
];

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Check',
];

export const COFFEE_PRICE_PER_KG = {
  AA: 1200,
  AB: 1000,
  PB: 1100,
  C: 800,
  TT: 700,
  T: 600,
  E: 900,
  FNGS: 550,
  BF: 500,
  BL: 450,
  HB: 400,
  HE: 350,
  SGH: 300,
  'MH/ML': 250,
};

export const STATUS_COLORS = {
  [STATUS.ACTIVE]: 'text-green-700 bg-green-100',
  [STATUS.INACTIVE]: 'text-gray-700 bg-gray-100',
  [STATUS.PENDING]: 'text-yellow-700 bg-yellow-100',
  [STATUS.APPROVED]: 'text-green-700 bg-green-100',
  [STATUS.REJECTED]: 'text-red-700 bg-red-100',
  [STATUS.COMPLETED]: 'text-blue-700 bg-blue-100',
  [STATUS.CANCELLED]: 'text-red-700 bg-red-100',
  [STATUS.IN_STOCK]: 'text-green-700 bg-green-100',
  [STATUS.LOW_STOCK]: 'text-yellow-700 bg-yellow-100',
  [STATUS.OUT_OF_STOCK]: 'text-red-700 bg-red-100',
  [STATUS.PAID]: 'text-green-700 bg-green-100',
  [STATUS.UNPAID]: 'text-red-700 bg-red-100',
  [STATUS.PARTIAL]: 'text-yellow-700 bg-yellow-100',
};
