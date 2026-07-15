import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  up,
  color = "text-primary",
  bg = "bg-primary/10",
  borderColor = "#2E7D32",
  delay = 0,
  layout = "vertical",
}) {
  if (layout === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        className="rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
        style={{ borderTop: `2px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-4 border border-gray-100 border-t-0 rounded-b-xl p-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      style={{ borderTop: `2px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between border border-gray-100 border-t-0 rounded-b-xl p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              up ? "text-green-600" : "text-red-500"
            }`}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change}
          </span>
        )}
      </div>
      <div className="px-5 pb-5">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}
