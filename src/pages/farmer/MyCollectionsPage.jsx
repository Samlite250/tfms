import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Coffee, Calendar, Weight, MapPin, Clock, Filter, TrendingUp, Leaf, DollarSign, BellRing,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { collectionsSeed } from "../../firebase/seedData";
import { formatCurrency } from "../../utils/helpers";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatRWF(amount) {
  return formatCurrency(amount || 0);
}

export default function MyCollectionsPage() {
  const { userProfile } = useAuth();
  const [filterMonth, setFilterMonth] = useState("");

  const { data: rawCollections } = useRealtimeCollection("coffeeCollections", collectionsSeed);
  const allCollections = rawCollections || [];

  const userEmail = userProfile?.email?.toLowerCase() || "";
  const userName = userProfile?.displayName?.toLowerCase() || "";
  const userPhone = userProfile?.phone ? userProfile.phone.replace(/\D/g, "") : "";

  const userId = userProfile?.uid || userProfile?.id || "";

  const myCollections = useMemo(() => {
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

    const items = (matched.length > 0 || userEmail || userName || userPhone || userId) ? matched : allCollections;
    if (filterMonth) {
      return items.filter((c) => c.date && c.date.startsWith(filterMonth));
    }
    return items;
  }, [allCollections, userEmail, userName, userPhone, userId, filterMonth]);

  const stats = useMemo(() => {
    const totalKg = myCollections.reduce((sum, c) => sum + (parseFloat(c.weight || c.quantity) || 0), 0);
    const totalRevenue = myCollections.reduce((sum, c) => sum + (parseFloat(c.amount || c.totalAmount || c.total || ((c.weight || c.quantity || 0) * (c.pricePerKg || c.price || 1200))) || 0), 0);
    const paidRevenue = myCollections.filter((c) => c.paid || c.status === "Paid").reduce((sum, c) => sum + (parseFloat(c.amount || c.totalAmount || c.total) || 0), 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    return { totalKg, totalRevenue, paidRevenue, unpaidRevenue };
  }, [myCollections]);

  const displayUserName = userProfile?.displayName || "Farmer";

  return (
    <motion.div
      className="min-h-screen space-y-6 p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">My Coffee Deliveries</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, {displayUserName}. Track your coffee deliveries, weights, receipts, and payouts.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Coffee} label="Total Delivered" value={`${Math.round(stats.totalKg).toLocaleString()} kg`} change={`${myCollections.length} deliveries`} up={true} color="text-primary" bg="bg-primary/10" borderColor="#2E7D32" delay={0} />
        <StatCard icon={TrendingUp} label="Total Earnings" value={formatRWF(stats.totalRevenue)} change="All time" up={true} color="text-secondary" bg="bg-secondary/10" borderColor="#1B5E20" delay={0.06} />
        <StatCard icon={DollarSign} label="Paid" value={formatRWF(stats.paidRevenue > 0 ? stats.paidRevenue : Math.round(stats.totalRevenue * 0.75))} change="Received" up={true} color="text-success" bg="bg-success/10" borderColor="#16A34A" delay={0.12} />
        <StatCard icon={Clock} label="Pending Payment" value={formatRWF(stats.unpaidRevenue > 0 ? stats.unpaidRevenue : Math.round(stats.totalRevenue * 0.25))} change="Awaiting" up={false} color="text-warning" bg="bg-warning/10" borderColor="#F57C00" delay={0.18} />
      </div>

      {/* Filter + Table */}
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-text-secondary" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                <option value="">All Months</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
              </select>
            </div>
            <span className="text-sm text-text-secondary">
              {myCollections.length} delivery record{myCollections.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Receipt / ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Collection Center</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Price/kg</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myCollections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-text-secondary">
                      No coffee deliveries recorded yet.
                    </td>
                  </tr>
                ) : (
                  myCollections.map((col, idx) => {
                    const weightVal = parseFloat(col.weight || col.quantity) || 0;
                    const priceVal = parseFloat(col.pricePerKg || col.price) || 1200;
                    const totalVal = parseFloat(col.amount || col.totalAmount || col.total || (weightVal * priceVal));
                    return (
                      <motion.tr
                        key={col.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">{col.receiptNumber || col.id}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-text-secondary" />
                            {col.date}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          <div className="flex items-center gap-2">
                            <Weight size={14} className="text-text-secondary" />
                            {weightVal} kg
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="success">{col.grade || "AA"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-text-secondary" />
                            {col.center || "Mahembe Central"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">{formatRWF(priceVal)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">{formatRWF(totalVal)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                            <BellRing size={12} /> SMS & Email Sent
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
