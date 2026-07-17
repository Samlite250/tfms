/**
 * Supabase Setup Script for COMS
 * Creates admin user, seeds database tables with sample data.
 *
 * Usage: node scripts/setup-supabase.js
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const rootDir = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const envPath = resolve(rootDir, '.env');

function readEnv(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => {
        const sep = l.indexOf('=');
        return sep === -1 ? [l, ''] : [l.slice(0, sep).trim(), l.slice(sep + 1).trim()];
      })
  );
}

const env = readEnv(envPath);
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'yolaearn@gmail.com';
const ADMIN_PASSWORD = '@Mahembe1';
const ADMIN_NAME = 'COMS Administrator';

const USERS_SEED = [
  { email: 'yolaearn@gmail.com', password: ADMIN_PASSWORD, displayName: ADMIN_NAME, role: 'admin', department: 'Administration', phone: '+250 788 100 200', status: 'active' },
  { email: 'manager@mahembe-coffee.rw', password: 'manager123', displayName: 'Marie Claire Uwimana', role: 'factory_manager', department: 'Administration', phone: '+250 788 100 201', status: 'active' },
  { email: 'collection@mahembe-coffee.rw', password: 'collection123', displayName: 'Epiphanie Mukamana', role: 'collection_officer', department: 'Collection', phone: '+250 788 100 202', status: 'active' },
  { email: 'production@mahembe-coffee.rw', password: 'production123', displayName: 'Alexis Habimana', role: 'production_officer', department: 'Production', phone: '+250 788 100 203', status: 'active' },
  { email: 'store@mahembe-coffee.rw', password: 'store123', displayName: 'Anselme Rwegasira', role: 'store_keeper', department: 'Packaging', phone: '+250 788 100 204', status: 'active' },
  { email: 'accountant@mahembe-coffee.rw', password: 'accountant123', displayName: 'Arsene Nshimiyimana', role: 'accountant', department: 'Finance', phone: '+250 788 100 205', status: 'active' },
];

const FARMERS_SEED = [
  { name: "Jean-Paul Habimana", phone: "+250 788 123456", email: "jp.habimana@gmail.com", village: "Mahembe", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.5, coffee_variety: "Red Bourbon", collection_center: "Mahembe CC", total_deliveries: 48, total_weight: 1240, status: "Active", joined_date: "2024-03-15" },
  { name: "Marie Claire Uwimana", phone: "+250 783 234567", email: "mc.uwimana@yahoo.com", village: "Muhanga Town", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.2, coffee_variety: "Red Bourbon", collection_center: "Muhanga CC", total_deliveries: 36, total_weight: 890, status: "Active", joined_date: "2024-01-20" },
  { name: "Emmanuel Ndayisaba", phone: "+250 701 345678", email: "e.ndayisaba@gmail.com", village: "Ruyanza", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 2.0, coffee_variety: "Jackson", collection_center: "Ruyanza CC", total_deliveries: 62, total_weight: 1780, status: "Active", joined_date: "2023-11-08" },
  { name: "Claudine Mukamana", phone: "+250 775 456789", email: "c.mukamana@outlook.com", village: "Kabuga", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 0.8, coffee_variety: "Red Bourbon", collection_center: "Kabuga CC", total_deliveries: 22, total_weight: 520, status: "Active", joined_date: "2024-06-10" },
  { name: "Jean Mugabo", phone: "+250 786 567890", email: "j.mugabo@gmail.com", village: "Nyamagana", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 2.5, coffee_variety: "BM 139", collection_center: "Nyamagana CC", total_deliveries: 71, total_weight: 2100, status: "Active", joined_date: "2023-08-22" },
  { name: "Immaculee Nyirahabimana", phone: "+250 702 678901", email: "i.nyirahabimana@gmail.com", village: "Mahembe", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.0, coffee_variety: "Red Bourbon", collection_center: "Mahembe CC", total_deliveries: 18, total_weight: 410, status: "Inactive", joined_date: "2024-04-05" },
  { name: "Arsene Nshimiyimana", phone: "+250 773 789012", email: "a.nshimiyimana@yahoo.com", village: "Muhanga Town", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.8, coffee_variety: "Jackson", collection_center: "Muhanga CC", total_deliveries: 55, total_weight: 1520, status: "Active", joined_date: "2023-12-01" },
  { name: "Dative Uwera", phone: "+250 784 890123", email: "d.uwera@gmail.com", village: "Ruyanza", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.3, coffee_variety: "Red Bourbon", collection_center: "Ruyanza CC", total_deliveries: 40, total_weight: 1050, status: "Active", joined_date: "2024-02-14" },
  { name: "Patrick Sindzi", phone: "+250 705 901234", email: "p.sindzi@gmail.com", village: "Kabuga", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 2.2, coffee_variety: "BM 139", collection_center: "Kabuga CC", total_deliveries: 58, total_weight: 1680, status: "Active", joined_date: "2023-10-18" },
  { name: "Agnes Mukabutera", phone: "+250 776 012345", email: "a.mukabutera@outlook.com", village: "Nyamagana", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 0.6, coffee_variety: "Red Bourbon", collection_center: "Nyamagana CC", total_deliveries: 12, total_weight: 280, status: "Inactive", joined_date: "2024-07-25" },
  { name: "Theogene Bigirimana", phone: "+250 781 123456", email: "t.bigirimana@gmail.com", village: "Mahembe", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.6, coffee_variety: "Jackson", collection_center: "Mahembe CC", total_deliveries: 44, total_weight: 1180, status: "Active", joined_date: "2024-01-03" },
  { name: "Espérance Nyirarukundo", phone: "+250 703 234567", email: "e.nyirarukundo@yahoo.com", village: "Muhanga Town", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.1, coffee_variety: "Red Bourbon", collection_center: "Muhanga CC", total_deliveries: 30, total_weight: 740, status: "Active", joined_date: "2024-05-12" },
  { name: "Celestin Niyonzima", phone: "+250 777 345678", email: "c.niyonzima@gmail.com", village: "Ruyanza", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 2.8, coffee_variety: "BM 139", collection_center: "Ruyanza CC", total_deliveries: 65, total_weight: 1920, status: "Active", joined_date: "2023-09-30" },
  { name: "Odile Irambona", phone: "+250 782 456789", email: "o.irambona@gmail.com", village: "Kabuga", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 0.5, coffee_variety: "Red Bourbon", collection_center: "Kabuga CC", total_deliveries: 8, total_weight: 180, status: "Inactive", joined_date: "2024-08-19" },
  { name: "Jacques Kwizera", phone: "+250 704 567890", email: "j.kwizera@outlook.com", village: "Nyamagana", district: "Muhanga", province: "Southern", country: "Rwanda", farm_size: 1.9, coffee_variety: "Jackson", collection_center: "Nyamagana CC", total_deliveries: 50, total_weight: 1380, status: "Active", joined_date: "2023-12-15" },
];

function generateCollections() {
  const grades = ["AA", "AB", "PB", "C", "TT"];
  const gradePrices = { AA: 1200, AB: 1000, PB: 1100, C: 800, TT: 700 };
  const farmers = ["Jean-Paul Habimana", "Marie Claire Uwimana", "Emmanuel Ndayisaba", "Claudine Mukamana", "Jean Mugabo", "Immaculee Nyirahabimana", "Arsene Nshimiyimana", "Dative Uwera", "Patrick Sindzi", "Agnes Mukabutera", "Theogene Bigirimana", "Espérance Nyirarukundo"];
  const centers = ["Mahembe Central", "Muhanga Hub", "Ruyanza Collection Point", "Kabuga Station", "Nyamagana Center"];
  const collectors = ["Alexis Habimana", "Chantal Uwimana", "Ignace Niyonzima", "Epiphanie Mukamana"];
  const records = [];
  const now = new Date();
  for (let i = 1; i <= 24; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const weight = Math.round((20 + Math.random() * 80) * 10) / 10;
    records.push({
      receipt_number: `REC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(4, "0")}`,
      farmer_name: farmers[Math.floor(Math.random() * farmers.length)],
      collection_center: centers[Math.floor(Math.random() * centers.length)],
      weight,
      grade,
      moisture_content: Math.round((10 + Math.random() * 8) * 10) / 10,
      date: date.toISOString().split("T")[0],
      status: "Received",
      collected_by: collectors[Math.floor(Math.random() * collectors.length)],
    });
  }
  return records;
}

const DEPARTMENTS_SEED = [
  { name: "Administration", description: "General administration and management", status: "active" },
  { name: "Production", description: "Coffee processing and manufacturing", status: "active" },
  { name: "Collection", description: "Coffee cherry collection and farmer relations", status: "active" },
  { name: "Packaging", description: "Coffee packaging and storage", status: "active" },
  { name: "Finance", description: "Financial management and accounting", status: "active" },
  { name: "Quality Control", description: "Product quality testing and assurance", status: "active" },
  { name: "Maintenance", description: "Equipment and facility maintenance", status: "active" },
];

const EMPLOYEES_SEED = [
  { employee_id: "EMP-001", name: "Alexis Habimana", email: "a.habimana@mahembe-coffee.rw", phone: "+250 788 100 0001", role: "Production Officer", department: "Production", status: "active", hire_date: "2023-01-15", salary: 180000 },
  { employee_id: "EMP-002", name: "Chantal Uwimana", email: "c.uwimana@mahembe-coffee.rw", phone: "+250 788 100 0002", role: "Machine Operator", department: "Production", status: "active", hire_date: "2023-03-20", salary: 150000 },
  { employee_id: "EMP-003", name: "Ignace Niyonzima", email: "i.niyonzima@mahembe-coffee.rw", phone: "+250 788 100 0003", role: "Quality Controller", department: "Quality Control", status: "active", hire_date: "2022-11-08", salary: 160000 },
  { employee_id: "EMP-004", name: "Epiphanie Mukamana", email: "e.mukamana@mahembe-coffee.rw", phone: "+250 788 100 0004", role: "Collection Officer", department: "Collection", status: "active", hire_date: "2023-06-10", salary: 140000 },
  { employee_id: "EMP-005", name: "Jean-Bosco Bizimana", email: "jb.bizimana@mahembe-coffee.rw", phone: "+250 788 100 0005", role: "Field Coordinator", department: "Collection", status: "active", hire_date: "2024-01-05", salary: 135000 },
  { employee_id: "EMP-006", name: "Anselme Rwegasira", email: "a.rwegasira@mahembe-coffee.rw", phone: "+250 788 100 0006", role: "Store Keeper", department: "Packaging", status: "active", hire_date: "2022-08-22", salary: 130000 },
  { employee_id: "EMP-007", name: "Yvette Uwimana", email: "y.uwimana@mahembe-coffee.rw", phone: "+250 788 100 0007", role: "Inventory Clerk", department: "Packaging", status: "active", hire_date: "2024-02-14", salary: 115000 },
  { employee_id: "EMP-008", name: "Arsene Nshimiyimana", email: "a.nshimiyimana@mahembe-coffee.rw", phone: "+250 788 100 0008", role: "Accountant", department: "Finance", status: "active", hire_date: "2022-05-30", salary: 200000 },
  { employee_id: "EMP-009", name: "Thierry Ndayisaba", email: "t.ndayisaba@mahembe-coffee.rw", phone: "+250 788 100 0009", role: "Junior Accountant", department: "Finance", status: "active", hire_date: "2024-04-01", salary: 120000 },
  { employee_id: "EMP-010", name: "Josiane Nyirahabimana", email: "j.nyirahabimana@mahembe-coffee.rw", phone: "+250 788 100 0010", role: "Data Entry Clerk", department: "Collection", status: "inactive", hire_date: "2023-09-15", salary: 100000 },
  { employee_id: "EMP-011", name: "Dieudonné Hakizimana", email: "d.hakizimana@mahembe-coffee.rw", phone: "+250 788 100 0011", role: "Warehouse Assistant", department: "Packaging", status: "active", hire_date: "2024-06-01", salary: 95000 },
  { employee_id: "EMP-012", name: "Françoise Uwiragiye", email: "f.uwiragiye@mahembe-coffee.rw", phone: "+250 788 100 0012", role: "HR Officer", department: "Administration", status: "active", hire_date: "2023-07-20", salary: 155000 },
];

const PRODUCTION_SEED = [
  { batch_number: "BATCH-2026-001", product_name: "AA Coffee", grade: "AA", input_weight: 450, output_weight: 95, status: "Completed", start_date: "2026-07-14", end_date: "2026-07-14", processed_by: "Alexis Habimana", notes: "High quality AA grade" },
  { batch_number: "BATCH-2026-002", product_name: "AB Coffee", grade: "AB", input_weight: 380, output_weight: 78, status: "Completed", start_date: "2026-07-14", end_date: "2026-07-14", processed_by: "Chantal Uwimana", notes: "Standard processing" },
  { batch_number: "BATCH-2026-003", product_name: "C Grade Coffee", grade: "C", input_weight: 520, output_weight: 110, status: "Completed", start_date: "2026-07-13", end_date: "2026-07-13", processed_by: "Ignace Niyonzima", notes: "C grade batch" },
  { batch_number: "BATCH-2026-004", product_name: "PB Coffee", grade: "PB", input_weight: 400, output_weight: 84, status: "Completed", start_date: "2026-07-13", end_date: "2026-07-13", processed_by: "Alexis Habimana", notes: "Peaberry premium" },
  { batch_number: "BATCH-2026-005", product_name: "AA Coffee", grade: "AA", input_weight: 350, output_weight: 73, status: "Completed", start_date: "2026-07-12", end_date: "2026-07-12", processed_by: "Chantal Uwimana", notes: "Excellent quality" },
  { batch_number: "BATCH-2026-006", product_name: "TT Coffee", grade: "TT", input_weight: 600, output_weight: 128, status: "In Progress", start_date: "2026-07-12", end_date: null, processed_by: "Ignace Niyonzima", notes: "TT processing" },
  { batch_number: "BATCH-2026-007", product_name: "AB Coffee", grade: "AB", input_weight: 480, output_weight: 100, status: "Completed", start_date: "2026-07-11", end_date: "2026-07-11", processed_by: "Alexis Habimana", notes: "Washed process" },
  { batch_number: "BATCH-2026-008", product_name: "PB Coffee", grade: "PB", input_weight: 320, output_weight: 66, status: "Completed", start_date: "2026-07-11", end_date: "2026-07-11", processed_by: "Chantal Uwimana", notes: "Standard batch" },
];

const INVENTORY_SEED = [
  { item_name: "Green Coffee AA", category: "Coffee Products", quantity: 2400, unit: "kg", minimum_stock: 500, location: "Warehouse A", unit_price: 1200, status: "In Stock" },
  { item_name: "Green Coffee AB", category: "Coffee Products", quantity: 1800, unit: "kg", minimum_stock: 400, location: "Warehouse A", unit_price: 1000, status: "In Stock" },
  { item_name: "Green Coffee PB", category: "Coffee Products", quantity: 3200, unit: "kg", minimum_stock: 600, location: "Warehouse B", unit_price: 1100, status: "In Stock" },
  { item_name: "Coffee Grade C", category: "Coffee Products", quantity: 800, unit: "kg", minimum_stock: 300, location: "Warehouse B", unit_price: 800, status: "Low Stock" },
  { item_name: "Jute Bags (60kg)", category: "Packaging", quantity: 12000, unit: "pcs", minimum_stock: 2000, location: "Store Room 1", unit_price: 2500, status: "In Stock" },
  { item_name: "GrainPro Bags", category: "Packaging", quantity: 3500, unit: "pcs", minimum_stock: 1500, location: "Store Room 1", unit_price: 1500, status: "Low Stock" },
  { item_name: "Sample Bags (300g)", category: "Packaging", quantity: 45000, unit: "pcs", minimum_stock: 8000, location: "Store Room 2", unit_price: 200, status: "In Stock" },
  { item_name: "Fertilizer (NPK)", category: "Raw Materials", quantity: 2500, unit: "kg", minimum_stock: 500, location: "Store Room 3", unit_price: 450, status: "In Stock" },
  { item_name: "Pesticide (Organic)", category: "Raw Materials", quantity: 150, unit: "liters", minimum_stock: 50, location: "Store Room 3", unit_price: 3500, status: "Low Stock" },
  { item_name: "Pulping Machine Parts", category: "Equipment", quantity: 24, unit: "pcs", minimum_stock: 5, location: "Maintenance Store", unit_price: 25000, status: "In Stock" },
];

const CUSTOMERS_SEED = [
  { name: "Nairobi Coffee Merchants", email: "james@nairobicoffee.co.ke", phone: "+254 722 100200", address: "Nairobi, Kenya", type: "business", status: "active" },
  { name: "European Coffee Imports", email: "hans@europcoffee.de", phone: "+49 176 200300", address: "Hamburg, Germany", type: "business", status: "active" },
  { name: "Kigali Roasters", email: "diane@kigaliroasters.rw", phone: "+250 788 300400", address: "Kigali, Rwanda", type: "business", status: "active" },
  { name: "Butare Coffee House", email: "felix@butarecoffee.rw", phone: "+250 775 400500", address: "Huye, Rwanda", type: "business", status: "active" },
  { name: "Muhanga Coffee Co-op", email: "alice@muhangacoop.rw", phone: "+250 788 500600", address: "Muhanga, Rwanda", type: "business", status: "active" },
  { name: "US Specialty Buyers", email: "sarah@usspecialtycoffee.com", phone: "+1 312 600700", address: "Chicago, USA", type: "business", status: "active" },
  { name: "Dubai Coffee Traders", email: "ahmed@dubaicoffee.ae", phone: "+971 50 700800", address: "Dubai, UAE", type: "business", status: "active" },
];

const SALES_SEED = [
  { customer_name: "Nairobi Coffee Merchants", product_name: "AA Coffee - 500kg", quantity: 500, unit_price: 1200, total_amount: 600000, date: "2026-07-14", status: "Paid", notes: "Bank Transfer" },
  { customer_name: "European Coffee Imports", product_name: "AB Coffee - 800kg", quantity: 800, unit_price: 1000, total_amount: 800000, date: "2026-07-13", status: "Paid", notes: "Bank Transfer" },
  { customer_name: "Kigali Roasters", product_name: "PB Coffee - 300kg", quantity: 300, unit_price: 1100, total_amount: 330000, date: "2026-07-12", status: "Pending", notes: "Credit" },
  { customer_name: "Butare Coffee House", product_name: "C Grade - 200kg", quantity: 200, unit_price: 800, total_amount: 160000, date: "2026-07-11", status: "Paid", notes: "Mobile Money" },
  { customer_name: "Muhanga Coffee Co-op", product_name: "AA Coffee - 250kg, AB Coffee - 150kg", quantity: 400, unit_price: 1075, total_amount: 450000, date: "2026-07-10", status: "Pending", notes: "Credit" },
  { customer_name: "US Specialty Buyers", product_name: "PB Coffee - 600kg", quantity: 600, unit_price: 1100, total_amount: 660000, date: "2026-07-09", status: "Paid", notes: "Bank Transfer" },
  { customer_name: "Dubai Coffee Traders", product_name: "AB Coffee - 400kg", quantity: 400, unit_price: 1000, total_amount: 400000, date: "2026-07-08", status: "Overdue", notes: "Credit" },
];

const EXPENSES_SEED = [
  { category: "Labor", description: "Weekly wages - Collection team", amount: 850000, date: "2026-07-14", approved_by: "Jean-Paul Habimana", status: "Paid", notes: "Bank Transfer" },
  { category: "Transport", description: "Cherry transport from Mahembe farms", amount: 320000, date: "2026-07-13", approved_by: "Emmanuel Ndayisaba", status: "Paid", notes: "Mobile Money" },
  { category: "Maintenance", description: "Pulping machine annual service", amount: 1850000, date: "2026-07-12", approved_by: "Jean-Paul Habimana", status: "Paid", notes: "Bank Transfer" },
  { category: "Utilities", description: "Electricity bill - Factory", amount: 450000, date: "2026-07-11", approved_by: "Arsene Nshimiyimana", status: "Paid", notes: "Bank Transfer" },
  { category: "Raw Materials", description: "Fertilizer purchase - NPK blend", amount: 680000, date: "2026-07-10", approved_by: "Emmanuel Ndayisaba", status: "Pending", notes: "Credit" },
  { category: "Packaging", description: "Jute bags and GrainPro restocking", amount: 290000, date: "2026-07-09", approved_by: "Arsene Nshimiyimana", status: "Paid", notes: "Bank Transfer" },
  { category: "Administrative", description: "Office supplies and stationery", amount: 75000, date: "2026-07-08", approved_by: "Jean-Paul Habimana", status: "Paid", notes: "Cash" },
  { category: "Insurance", description: "Monthly factory insurance premium", amount: 420000, date: "2026-07-07", approved_by: "Jean-Paul Habimana", status: "Paid", notes: "Bank Transfer" },
];

async function insertBatch(table, records) {
  let inserted = 0;
  for (const record of records) {
    const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' });
    if (error) {
      if (error.code === '23505') {
        // duplicate key, skip
      } else {
        console.error(`  Error inserting into ${table}:`, error.message);
      }
    } else {
      inserted++;
    }
  }
  return inserted;
}

async function seedDataTable(table, records) {
  let inserted = 0;
  for (const record of records) {
    const { error } = await supabase.from(table).insert(record);
    if (error) {
      if (error.code === '23505') {
        // duplicate, skip
      } else {
        console.error(`  Error inserting into ${table}:`, error.message);
      }
    } else {
      inserted++;
    }
  }
  return inserted;
}

async function setup() {
  console.log('========================================');
  console.log('  COMS Supabase Setup Script');
  console.log('========================================\n');

  // Step 1: Sign in admin auth user (must already exist in Supabase Auth)
  console.log('1. Signing in as admin...');
  let adminUserId = null;

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (signInError) {
    if (signInError.message.includes('Invalid login') || signInError.message.includes('invalid')) {
      console.log('  Admin not found. Creating admin auth user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: { data: { displayName: ADMIN_NAME } },
      });
      if (signUpError) {
        console.error('  Sign up error:', signUpError.message);
      } else {
        adminUserId = signUpData.user.id;
        console.log(`  Admin created (pending email confirmation). User ID: ${adminUserId}`);
        console.log('  IMPORTANT: Go to Supabase Dashboard > Authentication > Users');
        console.log('  and click "Confirm email" for yolaearn@gmail.com');
        console.log('  Then re-run this script.');
        await supabase.auth.signOut();
      }
    } else {
      console.error('  Sign in error:', signInError.message);
    }
  } else {
    adminUserId = signInData.user.id;
    console.log(`  Signed in. User ID: ${adminUserId}`);
  }

  // Step 2: Skip staff auth users for now (rate limits + email confirmation)
  console.log('\n2. Skipping staff auth users (rate limits).');
  console.log('   Staff profiles will be created when they sign up via the app.');

  // Step 3: Check if schema tables exist by querying users
  console.log('\n3. Checking database schema...');
  const { error: schemaCheck } = await supabase.from('users').select('id').limit(1);
  if (schemaCheck) {
    console.log('  ERROR: Schema not applied!');
    console.log(`  ${schemaCheck.message}`);
    console.log('\n  You MUST run the SQL schema first:');
    console.log('  1. Go to Supabase Dashboard > SQL Editor');
    console.log('  2. Paste contents of src/supabase/schema.sql');
    console.log('  3. Click "Run"');
    console.log('  4. Then re-run this script\n');
    return;
  }
  console.log('  Schema tables found!');

  // Re-sign in as admin to ensure we have a valid session
  if (!adminUserId) {
    console.log('\n  Re-signing in as admin...');
    const { data: reSignIn, error: reSignInErr } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (reSignInErr) {
      console.error('  Cannot sign in as admin:', reSignInErr.message);
      console.log('  Skipping admin profile and farmer seeding (need confirmed auth user)');
      console.log('  Please confirm the admin email in Supabase Dashboard and re-run.');
      return;
    }
    adminUserId = reSignIn.user.id;
    console.log(`  Signed in. User ID: ${adminUserId}`);
  }

  // Step 4: Insert admin user profile (requires confirmed auth user)
  console.log('\n4. Inserting admin user profile...');
  if (adminUserId) {
    const { error } = await supabase.from('users').upsert({
      id: adminUserId,
      email: ADMIN_EMAIL,
      display_name: ADMIN_NAME,
      role: 'admin',
      department: 'Administration',
      phone: '+250 788 100 200',
      status: 'active',
    }, { onConflict: 'id' });
    if (error) {
      console.error('  Admin profile error:', error.message);
      if (error.message.includes('foreign key')) {
        console.log('  The admin auth user needs email confirmation first.');
        console.log('  Please go to Supabase Dashboard > Authentication > Users');
        console.log('  Find yolaearn@gmail.com and click "Confirm email"');
        console.log('  Then re-run this script.');
        return;
      }
    } else {
      console.log('  Admin profile inserted');
    }
  } else {
    console.log('  Cannot insert admin profile - no confirmed auth user ID');
    console.log('  Please confirm the admin email in Supabase Dashboard first.');
    return;
  }

  // Step 5: Seed departments
  console.log('\n5. Seeding departments...');
  for (const dept of DEPARTMENTS_SEED) {
    const { error } = await supabase.from('departments').upsert(dept, { onConflict: 'name' });
    if (error && error.code !== '23505') console.error(`  ${dept.name}: ${error.message}`);
  }
  console.log(`  ${DEPARTMENTS_SEED.length} departments seeded`);

  // Step 6: Seed farmers (UUID auto-generated)
  console.log('\n6. Seeding farmers...');
  let farmerCount = 0;
  for (const farmer of FARMERS_SEED) {
    const farmerWithId = { id: randomUUID(), ...farmer };
    const { error } = await supabase.from('farmers').insert(farmerWithId);
    if (error) console.error(`  ${farmer.name}: ${error.message}`);
    else farmerCount++;
  }
  console.log(`  ${farmerCount} farmers seeded`);

  // Step 7: Seed employees
  console.log('\n7. Seeding employees...');
  let empCount = 0;
  for (const emp of EMPLOYEES_SEED) {
    const { error } = await supabase.from('employees').upsert(emp, { onConflict: 'employee_id' });
    if (error && error.code !== '23505') console.error(`  ${emp.name}: ${error.message}`);
    else empCount++;
  }
  console.log(`  ${empCount} employees seeded`);

  // Step 8: Seed collections
  console.log('\n8. Seeding coffee collections...');
  const collections = generateCollections();
  let colCount = 0;
  for (const col of collections) {
    const { error } = await supabase.from('coffee_collections').insert(col);
    if (error && error.code !== '23505') console.error(`  ${col.receipt_number}: ${error.message}`);
    else colCount++;
  }
  console.log(`  ${colCount} collections seeded`);

  // Step 9: Seed production
  console.log('\n9. Seeding production batches...');
  let prodCount = 0;
  for (const prod of PRODUCTION_SEED) {
    const { error } = await supabase.from('production').upsert(prod, { onConflict: 'batch_number' });
    if (error && error.code !== '23505') console.error(`  ${prod.batch_number}: ${error.message}`);
    else prodCount++;
  }
  console.log(`  ${prodCount} production batches seeded`);

  // Step 10: Seed inventory
  console.log('\n10. Seeding inventory...');
  let invCount = 0;
  for (const inv of INVENTORY_SEED) {
    const { error } = await supabase.from('inventory').insert(inv);
    if (error && error.code !== '23505') console.error(`  ${inv.item_name}: ${error.message}`);
    else invCount++;
  }
  console.log(`  ${invCount} inventory items seeded`);

  // Step 11: Seed customers
  console.log('\n11. Seeding customers...');
  let custCount = 0;
  for (const cust of CUSTOMERS_SEED) {
    const { error } = await supabase.from('customers').insert(cust);
    if (error && error.code !== '23505') console.error(`  ${cust.name}: ${error.message}`);
    else custCount++;
  }
  console.log(`  ${custCount} customers seeded`);

  // Step 12: Seed sales
  console.log('\n12. Seeding sales...');
  let saleCount = 0;
  for (const sale of SALES_SEED) {
    const { error } = await supabase.from('sales').insert(sale);
    if (error && error.code !== '23505') console.error(`  ${sale.product_name}: ${error.message}`);
    else saleCount++;
  }
  console.log(`  ${saleCount} sales seeded`);

  // Step 13: Seed expenses
  console.log('\n13. Seeding expenses...');
  let expCount = 0;
  for (const exp of EXPENSES_SEED) {
    const { error } = await supabase.from('expenses').insert(exp);
    if (error && error.code !== '23505') console.error(`  ${exp.description}: ${error.message}`);
    else expCount++;
  }
  console.log(`  ${expCount} expenses seeded`);

  // Mark system as seeded
  await supabase.from('system_status').upsert({ id: 'main', seeded: true }, { onConflict: 'id' });

  console.log('\n========================================');
  console.log('  Setup Complete!');
  console.log('========================================');
  console.log(`\nAdmin login:`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`\nNote: If email confirmation is enabled in Supabase,`);
  console.log(`the admin user may need to be confirmed first.`);
  console.log(`Go to Supabase Dashboard > Authentication > Users`);
  console.log(`and confirm the ${ADMIN_EMAIL} account manually.`);
  console.log(`\nThen run: npm run dev:full`);
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exitCode = 1;
});
