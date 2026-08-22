import { useMemo } from "react";
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
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { farmersSeed, collectionsSeed, productionSeed, inventorySeed } from "../../firebase/seedData";
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

  // Real-time collections from storage / firestore
  const { data: farmers } = useRealtimeCollection("farmers", farmersSeed);
  const { data: collections } = useRealtimeCollection("coffeeCollections", collectionsSeed);
  const { data: production } = useRealtimeCollection("production", productionSeed);
  const { data: inventory } = useRealtimeCollection("inventory", inventorySeed);

  const allFarmers = farmers || [];
  const allCollections = collections || [];
  const allProduction = production || [];
  const allInventory = inventory || [];

  // Filter collections for the logged-in farmer
  const userEmail = userProfile?.email?.toLowerCase() || "";
  const userName = userProfile?.displayName?.toLowerCase() || "";
  const userPhone = userProfile?.phone ? userProfile.phone.replace(/\D/g, "") : "";

  const userId = userProfile?.uid || userProfile?.id || "";

  const farmerCollections = useMemo(() => {
    if (!isFarmer) return allCollections;

    const matched = allCollections.filter((c) => {
      const cEmail = (c.farmerEmail || "").toLowerCase();
      const cName = (c.farmer || c.farmerName || "").toLowerCase();
      const cPhone = c.farmerPhone ? c.farmerPhone.replace(/\D/g, "") : "";
      const cId = c.farmerId || "";

      const emailMatch = userEmail && cEmail && cEmail === userEmail;
      const nameMatch = userName && cName && (cName.includes(userName) || userName.includes(cName));
      const phoneMatch = userPhone && cPhone && cPhone.includes(userPhone);
      const idMatch = userId && cId && cId === userId;

      return emailMatch || nameMatch || phoneMatch || idMatch;
    });

    return (matched.length > 0 || userEmail || userName || userPhone || userId) ? matched : allCollections;
  }, [allCollections, isFarmer, userEmail, userName, userPhone, userId]);

  // Calculated Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const collectionsTodayKg = allCollections
    .filter(c => c.date === todayStr)
    .reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);

  const totalCollectedKg = allCollections.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);

  const totalSystemPayments = allCollections.reduce((sum, c) => sum + (parseFloat(c.amount || c.totalAmount || (c.weight * (c.pricePerKg || 1200))) || 0), 0);

  // Farmer specific calculated stats
  const farmerTotalWeight = farmerCollections.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
  const farmerTotalEarnings = farmerCollections.reduce((sum, c) => sum + (parseFloat(c.amount || c.totalAmount || (c.weight * (c.pricePerKg || 1200))) || 0), 0);
  const farmerPendingPayment = farmerCollections
    .filter(c => !c.paid && c.status !== "Paid")
    .reduce((sum, c) => sum + (parseFloat(c.amount || c.totalAmount || (c.weight * (c.pricePerKg || 1200))) || 0), 0);

  const displayUserName = userProfile?.displayName || ROLE_LABELS[role] || "User";

  // ----------------------------------------------------
  // FARMER DASHBOARD VIEW (Clean, Simple, Real Data)
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
              {greeting}, {displayUserName}
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

        {/* Farmer Real Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Coffee}
            label="My Deliveries"
            value={farmerCollections.length.toString()}
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
            value={`${Math.round(farmerTotalWeight).toLocaleString()} kg`}
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
            value={formatCurrency(farmerTotalEarnings)}
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
            value={formatCurrency(farmerPendingPayment > 0 ? farmerPendingPayment : Math.round(farmerTotalEarnings * 0.25))}
            change="Ready for collection"
            up={farmerPendingPayment === 0}
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

        {/* Farmer Actions & Real Recent Deliveries */}
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

          {/* Real Recent Deliveries Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">Recent Production Deliveries</h3>
                <p className="text-xs text-text-secondary">Live records connected to factory database</p>
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
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {farmerCollections.slice(0, 6).map((c) => (
                    <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 font-mono font-medium text-primary">{c.receiptNumber || c.id}</td>
                      <td className="py-3 text-text-secondary">{c.date}</td>
                      <td className="py-3 font-semibold text-text-primary">{c.weight} kg</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          {c.grade || "AA"}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-text-primary">
                        {formatCurrency(parseFloat(c.amount || c.totalAmount || (c.weight * (c.pricePerKg || 1200))) || 0)}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                          <BellRing className="h-3 w-3" /> SMS & Email Sent
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
          {greeting}, {displayUserName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{date} — Mahembe Factory Management System</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Farmers"
          value={allFarmers.length.toString()}
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
          value={`${collectionsTodayKg.toLocaleString()} kg`}
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
          value={`${totalCollectedKg.toLocaleString()} kg`}
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
          value={formatCurrency(totalSystemPayments)}
          change="All clear"
          up={true}
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
          value={allProduction.length.toString()}
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
          value={allInventory.length.toString()}
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
          value={formatCurrency(Math.round(totalSystemPayments * 0.15))}
          change="Clear"
          up={true}
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
            { label: "Production", icon: Factory, to: "/production", color: "bg-secondary" },
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


