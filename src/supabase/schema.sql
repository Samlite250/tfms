-- ============================================================
-- COMS Database Schema for Supabase (PostgreSQL)
-- Coffee Factory Operation Management System
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS (profiles linked to Supabase Auth)
-- ============================================================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text default '',
  role text default 'collection_officer',
  department text default '',
  phone text default '',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. PENDING FARMERS (awaiting approval)
-- ============================================================
create table if not exists pending_farmers (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  name text default '',
  phone text default '',
  district text default '',
  sector text default '',
  cell text default '',
  village text default '',
  province text default 'Southern',
  country text default 'Rwanda',
  farm_size numeric default 0,
  coffee_variety text default '',
  collection_center text default '',
  total_deliveries integer default 0,
  total_weight numeric default 0,
  status text default 'Pending',
  joined_date date,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. FARMERS (active farmers)
-- ============================================================
create table if not exists farmers (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  name text default '',
  phone text default '',
  district text default '',
  sector text default '',
  cell text default '',
  village text default '',
  province text default 'Southern',
  country text default 'Rwanda',
  farm_size numeric default 0,
  coffee_variety text default '',
  collection_center text default '',
  total_deliveries integer default 0,
  total_weight numeric default 0,
  status text default 'Active',
  joined_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. EMPLOYEES
-- ============================================================
create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  employee_id text unique,
  name text not null,
  email text default '',
  phone text default '',
  role text default '',
  department text default '',
  status text default 'active',
  hire_date date,
  salary numeric default 0,
  address text default '',
  emergency_contact text default '',
  emergency_phone text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 5. COFFEE COLLECTIONS
-- ============================================================
create table if not exists coffee_collections (
  id uuid primary key default uuid_generate_v4(),
  receipt_number text unique,
  farmer_id uuid,
  farmer_name text default '',
  farmer_email text default '',
  collection_center text default '',
  weight numeric default 0,
  grade text default '',
  moisture_content numeric default 0,
  date date default current_date,
  status text default 'Received',
  notes text default '',
  collected_by text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 6. PRODUCTION
-- ============================================================
create table if not exists production (
  id uuid primary key default uuid_generate_v4(),
  batch_number text unique,
  product_name text default '',
  input_weight numeric default 0,
  output_weight numeric default 0,
  grade text default '',
  status text default 'Planned',
  start_date date,
  end_date date,
  notes text default '',
  processed_by text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 7. INVENTORY
-- ============================================================
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  item_name text default '',
  category text default '',
  quantity numeric default 0,
  unit text default 'kg',
  minimum_stock numeric default 0,
  location text default '',
  supplier text default '',
  unit_price numeric default 0,
  status text default 'In Stock',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 8. CUSTOMERS
-- ============================================================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text default '',
  phone text default '',
  address text default '',
  type text default 'individual',
  status text default 'active',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 9. SALES
-- ============================================================
create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid,
  customer_name text default '',
  product_name text default '',
  quantity numeric default 0,
  unit_price numeric default 0,
  total_amount numeric default 0,
  date date default current_date,
  status text default 'Pending',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 10. EXPENSES
-- ============================================================
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  category text default '',
  description text default '',
  amount numeric default 0,
  date date default current_date,
  approved_by text default '',
  status text default 'Pending',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 11. DEPARTMENTS
-- ============================================================
create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text default '',
  head text default '',
  employee_count integer default 0,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 12. SETTINGS
-- ============================================================
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text default '',
  category text default 'general',
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 13. ACTIVITY LOGS
-- ============================================================
create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action text default '',
  module text default '',
  details text default '',
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- 14. PAYMENTS
-- ============================================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  payment_number text unique,
  farmer_id uuid,
  farmer_name text default '',
  farmer_email text default '',
  collection_id uuid,
  receipt_number text default '',
  weight numeric default 0,
  grade text default '',
  price_per_kg numeric default 0,
  amount numeric default 0,
  payment_method text default 'Mobile Money',
  status text default 'Pending',
  date date default current_date,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 15. NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  type text default '',
  user_id uuid,
  farmer_id uuid,
  farmer_name text default '',
  farmer_email text default '',
  title text default '',
  message text default '',
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 16. CONTACT MESSAGES (from landing page form)
-- ============================================================
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text default '',
  email text default '',
  phone text default '',
  subject text default '',
  message text default '',
  status text default 'new',
  created_at timestamptz default now()
);

-- ============================================================
-- 17. MESSAGES (messaging system)
-- ============================================================
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  from_name text default '',
  from_email text default '',
  from_role text default '',
  to_name text default '',
  to_email text default '',
  subject text default '',
  body text default '',
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 18. SYSTEM STATUS (seed tracking)
-- ============================================================
create table if not exists system_status (
  id text primary key,
  seeded boolean default false,
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_users_status on users(status);
create index if not exists idx_farmers_status on farmers(status);
create index if not exists idx_farmers_collection_center on farmers(collection_center);
create index if not exists idx_coffee_collections_farmer_id on coffee_collections(farmer_id);
create index if not exists idx_coffee_collections_date on coffee_collections(date);
create index if not exists idx_coffee_collections_status on coffee_collections(status);
create index if not exists idx_production_status on production(status);
create index if not exists idx_inventory_status on inventory(status);
create index if not exists idx_payments_farmer_id on payments(farmer_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_messages_from_email on messages(from_email);
create index if not exists idx_messages_to_email on messages(to_email);
create index if not exists idx_messages_subject on messages(subject);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);
create index if not exists idx_activity_logs_user_id on activity_logs(user_id);
create index if not exists idx_contact_messages_status on contact_messages(status);

-- ============================================================
-- ENABLE REALTIME on tables that need live updates
-- ============================================================
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table farmers;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table contact_messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table pending_farmers;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — disable for now, enable per-table later
-- For demo/student project, we'll use permissive policies
-- ============================================================
alter table users enable row level security;
alter table farmers enable row level security;
alter table pending_farmers enable row level security;
alter table messages enable row level security;
alter table contact_messages enable row level security;
alter table notifications enable row level security;
alter table employees enable row level security;
alter table coffee_collections enable row level security;
alter table production enable row level security;
alter table inventory enable row level security;
alter table payments enable row level security;
alter table activity_logs enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table expenses enable row level security;
alter table departments enable row level security;
alter table settings enable row level security;
alter table system_status enable row level security;

-- Permissive policies: allow all operations for authenticated users
-- (In production, you'd restrict these further)
do $$ begin
  -- Users: read own profile, admin reads all
  create policy "Users: full access" on users for all using (true) with check (true);
  create policy "Pending farmers: full access" on pending_farmers for all using (true) with check (true);
  create policy "Farmers: full access" on farmers for all using (true) with check (true);
  create policy "Employees: full access" on employees for all using (true) with check (true);
  create policy "Collections: full access" on coffee_collections for all using (true) with check (true);
  create policy "Production: full access" on production for all using (true) with check (true);
  create policy "Inventory: full access" on inventory for all using (true) with check (true);
  create policy "Customers: full access" on customers for all using (true) with check (true);
  create policy "Sales: full access" on sales for all using (true) with check (true);
  create policy "Expenses: full access" on expenses for all using (true) with check (true);
  create policy "Departments: full access" on departments for all using (true) with check (true);
  create policy "Settings: full access" on settings for all using (true) with check (true);
  create policy "Activity logs: full access" on activity_logs for all using (true) with check (true);
  create policy "Payments: full access" on payments for all using (true) with check (true);
  create policy "Notifications: full access" on notifications for all using (true) with check (true);
  create policy "Contact messages: full access" on contact_messages for all using (true) with check (true);
  create policy "Messages: full access" on messages for all using (true) with check (true);
  create policy "System status: full access" on system_status for all using (true) with check (true);
exception when others then null;
end $$;
