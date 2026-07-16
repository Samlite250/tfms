import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Coffee, Calendar, Weight, MapPin, Clock, Filter, TrendingUp, Leaf, DollarSign,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../contexts/AuthContext";

const mockFarmerCollections = [
  { id: "COL-5001", date: "2026-07-14", quantity: 120, grade: "AA", price: 4500, total: 540000, center: "Mahembe Central", status: "completed", paid: true },
  { id: "COL-5002", date: "2026-07-10", quantity: 85, grade: "AB", price: 3800, total: 323000, center: "Mahembe Central", status: "completed", paid: true },
  { id: "COL-5003", date: "2026-07-05", quantity: 200, grade: "AA", price: 4500, total: 900000, center: "Ruyanza CC", status: "completed", paid: true },
  { id: "COL-5004", date: "2026-06-28", quantity: 65, grade: "PB", price: 3500, total: 227500, center: "Mahembe Central", status: "completed", paid: true },
  { id: "COL-5005", date: "2026-06-20", quantity: 150, grade: "AA", price: 4500, total: 675000, center: "Muhanga Hub", status: "completed", paid: false },
  { id: "COL-5006", date: "2026-06-15", quantity: 90, grade: "AB", price: 3800, total: 342000, center: "Mahembe Central", status: "completed", paid: false },
  { id: "COL-5007", date: "2026-06-10", quantity: 180, grade: "AA", price: 4500, total: 810000, center: "Nyamagana Center", status: "completed", paid: true },
  { id: "COL-5008", date: "2026-06-01", quantity: 75, grade: "C", price: 2800, total: 210000, center: "Mahembe Central", status: "completed", paid: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatRWF(amount) {
  return `RWF ${amount.toLocaleString()}`;
}

export default function MyCollectionsPage() {
  const { userProfile } = useAuth();
  const [filterMonth, setFilterMonth] = useState("");

  const collections = useMemo(() => {
    let filtered = [...mockFarmerCollections];
    if (filterMonth) {
      filtered = filtered.filter((c) => c.date.startsWith(filterMonth));
    }
    return filtered;
  }, [filterMonth]);

  const stats = useMemo(() => {
    const totalKg = collections.reduce((sum, c) => sum + c.quantity, 0);
    const totalRevenue = collections.reduce((sum, c) => sum + c.total, 0);
    const paidRevenue = collections.filter((c) => c.paid).reduce((sum, c) => sum + c.total, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    return { totalKg, totalRevenue, paidRevenue, unpaidRevenue };
  }, [collections]);

  const userName = userProfile?.displayName || "Farmer";

  return (
    <motion.div
      className="min-h-screen space-y-6 p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">My Collections</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, {userName}. View your coffee collection history and payments.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Coffee} label="Total Collected" value={`${stats.totalKg} kg`} change={`${collections.length} deliveries`} up={true} color="text-primary" bg="bg-primary/10" borderColor="#2E7D32" delay={0} />
        <StatCard icon={TrendingUp} label="Total Earnings" value={formatRWF(stats.totalRevenue)} change="All time" up={true} color="text-secondary" bg="bg-secondary/10" borderColor="#1B5E20" delay={0.06} />
        <StatCard icon={DollarSign} label="Paid" value={formatRWF(stats.paidRevenue)} change="Received" up={true} color="text-success" bg="bg-success/10" borderColor="#16A34A" delay={0.12} />
        <StatCard icon={Clock} label="Pending Payment" value={formatRWF(stats.unpaidRevenue)} change="Awaiting" up={false} color="text-warning" bg="bg-warning/10" borderColor="#F57C00" delay={0.18} />
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
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
              </select>
            </div>
            <span className="text-sm text-text-secondary">
              {collections.length} collection{collections.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Collection ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Collection Center</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Price/kg</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-text-secondary">
                      No collections found.
                    </td>
                  </tr>
                ) : (
                  collections.map((col, idx) => (
                    <motion.tr
                      key={col.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-primary">{col.id}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-text-secondary" />
                          {col.date}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <Weight size={14} className="text-text-secondary" />
                          {col.quantity} kg
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="success">{col.grade}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-text-secondary" />
                          {col.center}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{formatRWF(col.price)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary">{formatRWF(col.total)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={col.paid ? "success" : "warning"} dot>
                          {col.paid ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
