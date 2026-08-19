import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  UserCheck,
  Building2,
  CalendarOff,
  Eye,
  Pencil,
  Trash2,
  UserCog,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { useToast } from "../../components/ui/Toast";

import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { employeesSeed } from "../../firebase/seedData";

const DEPARTMENTS = ["Production", "Collection", "Packaging", "Administration", "Finance"];

const STATUS_VARIANT = {
  Active: "success",
  Inactive: "default",
  "On Leave": "warning",
  Suspended: "danger",
};

export default function EmployeesPage() {
  const { data: employeesList, deleteItem } = useRealtimeCollection("employees", employeesSeed);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const { success } = useToast();

  const stats = useMemo(() => {
    const list = employeesList || [];
    const total = list.length;
    const active = list.filter((e) => e.status === "Active").length;
    const departments = new Set(list.map((e) => e.department).filter(Boolean)).size;
    const onLeave = list.filter((e) => e.status === "On Leave").length;
    return { total, active, departments, onLeave };
  }, [employeesList]);

  const filtered = useMemo(() => {
    return (employeesList || []).filter((emp) => {
      const fullName = `${emp.firstName || emp.name || ""} ${emp.lastName || ""}`.toLowerCase();
      const matchSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        (emp.id && String(emp.id).toLowerCase().includes(search.toLowerCase())) ||
        (emp.phone && String(emp.phone).includes(search));
      const matchDept = !deptFilter || emp.department === deptFilter;
      const matchStatus = !statusFilter || emp.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employeesList, search, deptFilter, statusFilter]);

  async function handleDelete() {
    if (deleteModal) {
      await deleteItem(deleteModal.id);
      success(`Employee ${deleteModal.firstName || deleteModal.name || ""} ${deleteModal.lastName || ""} deleted successfully`);
      setDeleteModal(null);
    }
  }

  const columns = [
    {
      header: "Employee ID",
      accessor: "id",
      render: (row) => <span className="font-medium text-primary">{row.id}</span>,
    },
    {
      header: "Name",
      accessor: "firstName",
      render: (row) => {
        const first = row.firstName || row.name || "Employee";
        const last = row.lastName || "";
        const fInitial = (first && first[0]) ? first[0] : "E";
        const lInitial = (last && last[0]) ? last[0] : "";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0 uppercase">
              {fInitial}{lInitial}
            </div>
            <div>
              <p className="font-medium text-text-primary">{first} {last}</p>
              <p className="text-xs text-text-secondary">{row.email || "N/A"}</p>
            </div>
          </div>
        );
      },
    },
    { header: "Department", accessor: "department", render: (row) => row.department || "N/A" },
    { header: "Position", accessor: "position", render: (row) => row.position || "N/A" },
    { header: "Phone", accessor: "phone", render: (row) => row.phone || "N/A" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || "default"} dot>
          {row.status || "Active"}
        </Badge>
      ),
    },
    {
      header: "Join Date",
      accessor: "joinDate",
      render: (row) => row.joinDate ? new Date(row.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <UserCog size={28} className="text-primary" />
            Employee Management
          </h1>
          <p className="text-text-secondary mt-1">Manage all employees of the coffee factory</p>
        </div>
        <Link to="/employees/new">
          <Button icon={UserPlus}>Add Employee</Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={stats.total} color="text-primary" bg="bg-primary/10" borderColor="#2E7D32" delay={0} />
        <StatCard icon={UserCheck} label="Active" value={stats.active} color="text-green-600" bg="bg-green-100" borderColor="#16A34A" delay={0.1} />
        <StatCard icon={Building2} label="Departments" value={stats.departments} color="text-blue-600" bg="bg-blue-100" borderColor="#2563EB" delay={0.2} />
        <StatCard icon={CalendarOff} label="On Leave" value={stats.onLeave} color="text-amber-600" bg="bg-amber-100" borderColor="#D97706" delay={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." className="sm:w-72" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <EmptyState
                        icon={Users}
                        title="No employees found"
                        description="Try adjusting your search or filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, idx) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.accessor} className="px-4 py-3 text-sm text-text-primary">
                          {col.render ? col.render(emp) : emp[col.accessor]}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/employees/${emp.id}`}>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" title="View">
                              <Eye size={16} />
                            </button>
                          </Link>
                          <Link to={`/employees/${emp.id}/edit`}>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteModal(emp)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
              Showing {filtered.length} of {employeesList.length} employees
            </div>
          )}
        </Card>
      </motion.div>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Employee"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteModal && (
          <p className="text-text-secondary">
            Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteModal.firstName} {deleteModal.lastName}</span> ({deleteModal.id})? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
