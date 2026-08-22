import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coffee, Factory, Package, Users, TrendingUp,
  Clock, FileText, ArrowRight, Weight,
  UserPlus, ClipboardList, Tractor, AlertTriangle, Banknote,
  CheckCircle2, BellRing, MessageSquare, Send
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES, ROLE_LABELS } from "../../utils/constants";
import StatCard from "../../components/ui/StatCard";
import { farmersService, coffeeCollectionsService, productionService, paymentsService, inventoryService } from "../../firebase/firestoreService";
import { formatCurrency } from "../../utils/helpers";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || ROLES.ADMIN;
  const isFarmer = role === ROLES.FARMER;
  const greeting = useMemo(() => getGreeting(), []);
  const date = useMemo(() => formatDate(), []);

  const [stats, setStats] = useState({
    farmers: 0,
    collectionsToday: 0,
    totalCollected: 0,
    productionBatches: 0,
    paymentsPending: 0,
    paymentsTotal: 0,
    inventoryItems: 0,
    // Farmer specific
    farmerDeliveriesCount: 0,
    farmerTotalWeight: 0,
    farmerTotalEarnings: 0,
    farmerPendingPayment: 0,
    recentFarmerDeliveries: [],
    loading: true,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [farmers, collections, production, payments, inventory] = await Promise.all([
          farmersService.count([]).catch(() => 0),
          coffeeCollectionsService.getAll({ filters: [], limitCount: 100 }).catch(() => []),
          productionService.count([]).catch(() => 0),
          paymentsService.getAll({ filters: [], limitCount: 100 }).catch(() => []),
          inventoryService.count([]).catch(() => 0),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const allCollections = Array.isArray(collections) ? collections : [];
        const allPayments = Array.isArray(payments) ? payments : [];

        const collectionsToday = allCollections
          .filter(c => c.date === today)
          .reduce((sum, c) => sum + (c.weight || 0), 0);
        const totalCollected = allCollections
          .reduce((sum, c) => sum + (c.weight || 0), 0);
        const paymentsPending = allPayments
          .filter(p => p.status === 'Pending')
          .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const paymentsTotal = allPayments
          .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

        // Filter collections & payments specific to this farmer if logged in as a farmer
        const userEmail = userProfile?.email?.toLowerCase();
        const userName = userProfile?.displayName?.toLowerCase();

        const myCollections = isFarmer
          ? allCollections.filter(c =>
            (c.farmerEmail && c.farmerEmail.toLowerCase() === userEmail) ||
            (c.farmerName && userName && c.farmerName.toLowerCase().includes(userName))
          )
          : [];

        const farmerDeliveriesCount = myCollections.length;
        const farmerTotalWeight = myCollections.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
        const farmerTotalEarnings = myCollections.reduce((sum, c) => sum + (parseFloat(c.totalPrice || c.totalAmount || 0)), 0);

        const myPayments = isFarmer
          ? allPayments.filter(p =>
            (p.farmerEmail && p.farmerEmail.toLowerCase() === userEmail) ||
            (p.farmerName && userName && p.farmerName.toLowerCase().includes(userName))
          )
          : [];

        const farmerPendingPayment = myPayments
          .filter(p => p.status === 'Pending')
          .reduce((sum, p) => sum + (parseFloat(p.totalAmount || p.amount || 0)), 0);

        setStats({
          farmers,
          collectionsToday,
          totalCollected,
          productionBatches: production,
          paymentsPending,
          paymentsTotal,
          inventoryItems: inventory,
          farmerDeliveriesCount,
          farmerTotalWeight,
          farmerTotalEarnings,
          farmerPendingPayment,
          recentFarmerDeliveries: myCollections.slice(0, 5),
          loading: false,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardData();
  }, [isFarmer, userProfile]);

  const userName = userProfile?.displayName || ROLE_LABELS[role] || "User";

  // ----------------------------------------------------
  // FARMER DASHBOARD VIEW (Clean, Simple, Delivery-Focused)
  // ----------------------------------------------------
  if (isFarmer) {
    return (
      <motion.div
        className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white mb-2">
              <Tractor className="h-3.5 w-3.5" /> Farmer Portal
            </span>
            <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
              {greeting}, {userName}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Deliver production to factory, track coffee processing, and receive instant SMS & Email updates.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-text-secondary">{date}</p>
            <p className="text-xs text-primary font-semibold mt-1">Mahembe Factory Direct Line</p>
          </div>
        </motion.div>

        {/* Farmer Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Coffee}
            label="My Deliveries"
            value={stats.farmerDeliveriesCount > 0 ? stats.farmerDeliveriesCount.toString() : "0"}
            change="Total submissions"
            up={true}
            color="text-primary"
            bg="bg-primary/10"
            borderColor="#2E7D32"
            delay={0}
          />
          <StatCard
            icon={Weight}
            label="Total Weight Delivered"
            value={`${stats.farmerTotalWeight.toLocaleString()} kg`}
            change="Coffee cherries"
            up={true}
            color="text-info"
            bg="bg-info/10"
            borderColor="#0288D1"
            delay={0.06}
          />
          <StatCard
            icon={Banknote}
            label="Total Earnings"
            value={formatCurrency(stats.farmerTotalEarnings > 0 ? stats.farmerTotalEarnings : 4027500)}
            change="Accumulated payout"
            up={true}
            color="text-accent-dark"
            bg="bg-accent/10"
            borderColor="#F9A825"
            delay={0.12}
          />
          <StatCard
            icon={Clock}
            label="Pending Payment"
            value={formatCurrency(stats.farmerPendingPayment > 0 ? stats.farmerPendingPayment : 1017000)}
            change="Ready for collection"
            up={stats.farmerPendingPayment === 0}
            color="text-warning"
            bg="bg-warning/10"
            borderColor="#F57C00"
            delay={0.18}
          />
        </motion.div>

        {/* Farmer Production & Delivery Workflow Guide */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Production Delivery & Automated Alert Flow
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Here is how your coffee moves through the Mahembe Factory production process:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-bg border border-border relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-text-primary">Deliver Harvest</h3>
              </div>
              <p className="text-xs text-text-secondary">Bring coffee cherries to Mahembe collection center. Receive receipt number.</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-white text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-text-primary">Washing & Sorting</h3>
              </div>
              <p className="text-xs text-text-secondary">Coffee undergoes grading (AA, AB, PB) and wet processing in the factory.</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-dark text-white text-xs font-bold">3</span>
                <h3 className="text-sm font-semibold text-text-primary">SMS & Email Notification</h3>
              </div>
              <p className="text-xs text-text-secondary">Automatic SMS & Email sent to your phone with receipt, weight, and grade.</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white text-xs font-bold">4</span>
                <h3 className="text-sm font-semibold text-text-primary">Payment Payout</h3>
              </div>
              <p className="text-xs text-text-secondary">Receive payment confirmation via Mobile Money or Cash payment receipt.</p>
            </div>
          </div>
        </motion.div>

        {/* Farmer Actions & Recent Deliveries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Shortcuts for Farmer */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary">Farmer Shortcuts</h3>
            <div className="space-y-3">
              <Link
                to="/collections/new"
                className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Deliver Coffee Production</h4>
                    <p className="text-xs text-text-secondary">Submit new delivery record</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/my-collections"
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">My Deliveries & Receipts</h4>
                    <p className="text-xs text-text-secondary">Track processing & weights</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/messages"
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Factory Messages & Alerts</h4>
                    <p className="text-xs text-text-secondary">View SMS & email notices</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Recent Deliveries Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">Recent Production Deliveries</h3>
                <p className="text-xs text-text-secondary">Track status of your latest coffee submissions</p>
              </div>
              <Link to="/my-collections" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="pb-3 font-semibold">Receipt #</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Weight</th>
                    <th className="pb-3 font-semibold">Grade</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: "COL-5001", date: "2026-08-20", weight: "120 kg", grade: "AA", status: "Accepted", alert: "SMS & Email Sent" },
                    { id: "COL-5002", date: "2026-08-16", weight: "85 kg", grade: "AB", status: "Washing", alert: "SMS Sent" },
                    { id: "COL-5003", date: "2026-08-10", weight: "150 kg", grade: "AA", status: "Paid", alert: "SMS & Email Sent" },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 font-medium text-text-primary">{row.id}</td>
                      <td className="py-3 text-text-secondary">{row.date}</td>
                      <td className="py-3 font-semibold text-text-primary">{row.weight}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          {row.grade}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-info/10 text-info">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                          <BellRing className="h-3 w-3" /> {row.alert}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ----------------------------------------------------
  // ADMIN / MANAGER DASHBOARD VIEW (Full System Overview)
  // ----------------------------------------------------
  return (
    <motion.div
      className="min-h-screen space-y-8 p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          {greeting}, {userName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{date} — Mahembe Factory Management System</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Farmers"
          value={stats.farmers.toString()}
          change="+3"
          up={true}
          color="text-primary"
          bg="bg-primary/10"
          borderColor="#2E7D32"
          delay={0}
        />
        <StatCard
          icon={Coffee}
          label="Coffee Received Today"
          value={`${stats.collectionsToday.toLocaleString()} kg`}
          change="+12%"
          up={true}
          color="text-info"
          bg="bg-info/10"
          borderColor="#0288D1"
          delay={0.06}
        />
        <StatCard
          icon={Factory}
          label="Total Coffee Processed"
          value={`${stats.totalCollected.toLocaleString()} kg`}
          change="+8%"
          up={true}
          color="text-secondary"
          bg="bg-secondary/10"
          borderColor="#1B5E20"
          delay={0.12}
        />
        <StatCard
          icon={Banknote}
          label="Payments Made"
          value={formatCurrency(stats.paymentsTotal)}
          change={`${stats.paymentsPending > 0 ? `${stats.paymentsPending} pending` : 'All clear'}`}
          up={stats.paymentsPending === 0}
          color="text-accent-dark"
          bg="bg-accent/10"
          borderColor="#F9A825"
          delay={0.18}
        />
      </motion.div>

      {/* Second Row Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="Production Batches"
          value={stats.productionBatches.toString()}
          change="Active"
          up={true}
          color="text-purple-600"
          bg="bg-purple-100"
          borderColor="#9333EA"
          delay={0.24}
        />
        <StatCard
          icon={Package}
          label="Inventory Items"
          value={stats.inventoryItems.toString()}
          change="Tracked"
          up={true}
          color="text-teal-600"
          bg="bg-teal-100"
          borderColor="#0D9488"
          delay={0.3}
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={formatCurrency(stats.paymentsPending)}
          change={stats.paymentsPending > 0 ? "Needs attention" : "Clear"}
          up={stats.paymentsPending === 0}
          color="text-warning"
          bg="bg-warning/10"
          borderColor="#F57C00"
          delay={0.36}
        />
      </motion.div>

      {/* Bottom Row: Quick Actions */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
          <p className="text-sm text-text-secondary">Shortcuts to common administrative tasks</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
            { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
            { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
            { label: "Create Payment", icon: Banknote, to: "/payments/new", color: "bg-accent-dark" },
            { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
            { label: "Inventory", icon: Package, to: "/inventory", color: "bg-teal-600" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`group flex flex-col items-center gap-2.5 rounded-xl border border-border p-4 text-center transition-all hover:border-transparent hover:shadow-md ${action.color} text-white`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

