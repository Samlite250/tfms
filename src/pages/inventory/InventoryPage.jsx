import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  AlertTriangle,
  DollarSign,
  Layers,
  Pencil,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const CATEGORIES = ["All", "Tea Stock", "Raw Materials", "Packaging", "Chemicals", "Fuel"];

const UNITS = { kg: "kg", liters: "L", pieces: "pcs", bags: "bags", boxes: "boxes" };

const MOCK_ITEMS = [
  { id: 1, name: "Green Tea Leaves (Premium)", category: "Tea Stock", quantity: 2450, unit: "kg", minStock: 500, costPerUnit: 12.5, supplier: "Highland Tea Estates", location: "Warehouse A", reorderPoint: 600, lastUpdated: "2026-07-13", description: "Premium grade green tea leaves from highland farms" },
  { id: 2, name: "Black Tea Leaves (Standard)", category: "Tea Stock", quantity: 1800, unit: "kg", minStock: 400, costPerUnit: 8.75, supplier: "Valley Plantations", location: "Warehouse A", reorderPoint: 500, lastUpdated: "2026-07-12", description: "Standard grade black tea leaves" },
  { id: 3, name: "Oolong Tea Leaves", category: "Tea Stock", quantity: 320, unit: "kg", minStock: 200, costPerUnit: 15.0, supplier: "Mountain View Estate", location: "Warehouse A", reorderPoint: 250, lastUpdated: "2026-07-11", description: "Premium oolong tea leaves" },
  { id: 4, name: "White Tea Buds", category: "Tea Stock", quantity: 85, unit: "kg", minStock: 100, costPerUnit: 22.0, supplier: "Silver Tip Farms", location: "Warehouse A", reorderPoint: 120, lastUpdated: "2026-07-10", description: "Delicate white tea buds" },
  { id: 5, name: "Matcha Powder", category: "Tea Stock", quantity: 45, unit: "kg", minStock: 50, costPerUnit: 35.0, supplier: "ShadeGrown Co.", location: "Warehouse B", reorderPoint: 60, lastUpdated: "2026-07-13", description: "Ceremonial grade matcha powder" },
  { id: 6, name: "Dried Tea Stems", category: "Tea Stock", quantity: 600, unit: "kg", minStock: 150, costPerUnit: 3.5, supplier: "Local Farms", location: "Warehouse A", reorderPoint: 200, lastUpdated: "2026-07-09", description: "Dried stems for blended teas" },
  { id: 7, name: "Cinnamon (Ceylon)", category: "Raw Materials", quantity: 180, unit: "kg", minStock: 100, costPerUnit: 18.0, supplier: "Spice Islands Ltd.", location: "Warehouse C", reorderPoint: 120, lastUpdated: "2026-07-12", description: "Ceylon cinnamon sticks" },
  { id: 8, name: "Cardamom Pods", category: "Raw Materials", quantity: 65, unit: "kg", minStock: 50, costPerUnit: 28.0, supplier: "Spice Islands Ltd.", location: "Warehouse C", reorderPoint: 60, lastUpdated: "2026-07-11", description: "Green cardamom pods" },
  { id: 9, name: "Dried Ginger", category: "Raw Materials", quantity: 90, unit: "kg", minStock: 60, costPerUnit: 9.5, supplier: "Root Harvest Co.", location: "Warehouse C", reorderPoint: 70, lastUpdated: "2026-07-13", description: "Dried and sliced ginger root" },
  { id: 10, name: "Lemon Grass", category: "Raw Materials", quantity: 40, unit: "kg", minStock: 30, costPerUnit: 5.0, supplier: "Herb Garden Supply", location: "Warehouse C", reorderPoint: 40, lastUpdated: "2026-07-10", description: "Fresh cut lemon grass" },
  { id: 11, name: "Sugar (Granulated)", category: "Raw Materials", quantity: 1200, unit: "kg", minStock: 300, costPerUnit: 1.2, supplier: "Sweet Valley Mills", location: "Warehouse D", reorderPoint: 400, lastUpdated: "2026-07-13", description: "White granulated sugar" },
  { id: 12, name: "Honey (Natural)", category: "Raw Materials", quantity: 150, unit: "liters", minStock: 50, costPerUnit: 8.5, supplier: "Bee Happy Apiaries", location: "Warehouse D", reorderPoint: 60, lastUpdated: "2026-07-12", description: "Pure natural honey" },
  { id: 13, name: "Milk Powder", category: "Raw Materials", quantity: 200, unit: "kg", minStock: 80, costPerUnit: 6.0, supplier: "Dairy Best Co.", location: "Warehouse D", reorderPoint: 100, lastUpdated: "2026-07-11", description: "Full cream milk powder" },
  { id: 14, name: "Tea Filter Bags", category: "Packaging", quantity: 15000, unit: "pieces", minStock: 5000, costPerUnit: 0.02, supplier: "PackRight Inc.", location: "Packaging Room", reorderPoint: 6000, lastUpdated: "2026-07-13", description: "Standard size tea filter bags" },
  { id: 15, name: "Cardboard Boxes (Medium)", category: "Packaging", quantity: 800, unit: "pieces", minStock: 200, costPerUnit: 0.75, supplier: "EcoBox Solutions", location: "Packaging Room", reorderPoint: 300, lastUpdated: "2026-07-12", description: "Medium tea gift boxes" },
  { id: 16, name: "Tea Tin Containers", category: "Packaging", quantity: 450, unit: "pieces", minStock: 150, costPerUnit: 2.5, supplier: "MetalPack Ltd.", location: "Packaging Room", reorderPoint: 200, lastUpdated: "2026-07-11", description: "Premium tea storage tins" },
  { id: 17, name: "Shrink Wrap Film", category: "Packaging", quantity: 30, unit: "rolls", minStock: 10, costPerUnit: 15.0, supplier: "WrapIt Co.", location: "Packaging Room", reorderPoint: 12, lastUpdated: "2026-07-10", description: "Clear shrink wrap film rolls" },
  { id: 18, name: "Sticker Labels", category: "Packaging", quantity: 2500, unit: "pieces", minStock: 1000, costPerUnit: 0.05, supplier: "PrintPro Services", location: "Packaging Room", reorderPoint: 1200, lastUpdated: "2026-07-13", description: "Branded product labels" },
  { id: 19, name: "Cellophane Wrappers", category: "Packaging", quantity: 60, unit: "rolls", minStock: 20, costPerUnit: 12.0, supplier: "PackRight Inc.", location: "Packaging Room", reorderPoint: 25, lastUpdated: "2026-07-09", description: "Clear cellophane wrapping rolls" },
  { id: 20, name: "Food-Grade Detergent", category: "Chemicals", quantity: 25, unit: "liters", minStock: 15, costPerUnit: 7.5, supplier: "CleanTech Chemicals", location: "Chemical Store", reorderPoint: 20, lastUpdated: "2026-07-12", description: "Equipment cleaning detergent" },
  { id: 21, name: "Water Purifier Tablets", category: "Chemicals", quantity: 50, unit: "pieces", minStock: 100, costPerUnit: 0.5, supplier: "PureWater Solutions", location: "Chemical Store", reorderPoint: 120, lastUpdated: "2026-07-11", description: "Water purification tablets" },
  { id: 22, name: "pH Testing Strips", category: "Chemicals", quantity: 200, unit: "pieces", minStock: 100, costPerUnit: 0.3, supplier: "LabSupply Co.", location: "Chemical Store", reorderPoint: 150, lastUpdated: "2026-07-13", description: "pH level testing strips for quality control" },
  { id: 23, name: "Citric Acid", category: "Chemicals", quantity: 15, unit: "kg", minStock: 10, costPerUnit: 4.0, supplier: "ChemPro Ltd.", location: "Chemical Store", reorderPoint: 15, lastUpdated: "2026-07-10", description: "Food-grade citric acid" },
  { id: 24, name: "Sodium Benzoate", category: "Chemicals", quantity: 8, unit: "kg", minStock: 5, costPerUnit: 6.5, supplier: "ChemPro Ltd.", location: "Chemical Store", reorderPoint: 8, lastUpdated: "2026-07-09", description: "Food preservative" },
  { id: 25, name: "Diesel Fuel", category: "Fuel", quantity: 800, unit: "liters", minStock: 200, costPerUnit: 1.35, supplier: "PetroLink Supply", location: "Fuel Depot", reorderPoint: 300, lastUpdated: "2026-07-13", description: "For generators and heavy machinery" },
  { id: 26, name: "Propane Gas", category: "Fuel", quantity: 120, unit: "liters", minStock: 80, costPerUnit: 0.9, supplier: "GasPro Supply", location: "Fuel Depot", reorderPoint: 100, lastUpdated: "2026-07-12", description: "For heating and drying processes" },
  { id: 27, name: "Coal (Charcoal)", category: "Fuel", quantity: 500, unit: "kg", minStock: 150, costPerUnit: 0.6, supplier: "Forest Charcoal Co.", location: "Fuel Depot", reorderPoint: 200, lastUpdated: "2026-07-11", description: "For traditional roasting" },
  { id: 28, name: "Bioethanol", category: "Fuel", quantity: 30, unit: "liters", minStock: 40, costPerUnit: 2.0, supplier: "GreenFuel Inc.", location: "Fuel Depot", reorderPoint: 50, lastUpdated: "2026-07-10", description: "Renewable biofuel for heating" },
  { id: 29, name: "Rice Husk", category: "Fuel", quantity: 350, unit: "kg", minStock: 100, costPerUnit: 0.15, supplier: "Local Mill", location: "Fuel Depot", reorderPoint: 150, lastUpdated: "2026-07-13", description: "Biomass fuel for kilns" },
  { id: 30, name: "Tea Dust (Byproduct)", category: "Tea Stock", quantity: 150, unit: "kg", minStock: 50, costPerUnit: 2.0, supplier: "Internal Production", location: "Warehouse A", reorderPoint: 75, lastUpdated: "2026-07-13", description: "Tea dust collected during processing" },
  { id: 31, name: "Packaging Tape", category: "Packaging", quantity: 40, unit: "rolls", minStock: 15, costPerUnit: 3.0, supplier: "PackRight Inc.", location: "Packaging Room", reorderPoint: 20, lastUpdated: "2026-07-12", description: "Clear packaging tape" },
  { id: 32, name: "Jute Bags", category: "Packaging", quantity: 250, unit: "pieces", minStock: 100, costPerUnit: 1.8, supplier: "EcoPack Solutions", location: "Packaging Room", reorderPoint: 120, lastUpdated: "2026-07-11", description: "Traditional jute tea bags" },
  { id: 33, name: "Essential Oil (Tea Tree)", category: "Chemicals", quantity: 12, unit: "liters", minStock: 8, costPerUnit: 15.0, supplier: "AromaPure Ltd.", location: "Chemical Store", reorderPoint: 10, lastUpdated: "2026-07-10", description: "Tea tree essential oil for flavoring" },
  { id: 34, name: "Mint Leaves (Dried)", category: "Raw Materials", quantity: 55, unit: "kg", minStock: 30, costPerUnit: 12.0, supplier: "Herb Garden Supply", location: "Warehouse C", reorderPoint: 40, lastUpdated: "2026-07-13", description: "Dried mint for herbal teas" },
  { id: 35, name: "Jasmine Flowers", category: "Raw Materials", quantity: 18, unit: "kg", minStock: 15, costPerUnit: 20.0, supplier: "Floral Harvest Co.", location: "Warehouse C", reorderPoint: 20, lastUpdated: "2026-07-12", description: "Dried jasmine flowers for scented tea" },
];

function getStatus(item) {
  if (item.quantity <= 0) return "Out of Stock";
  if (item.quantity <= item.minStock) return "Low Stock";
  return "In Stock";
}

function getStatusVariant(status) {
  if (status === "Out of Stock") return "danger";
  if (status === "Low Stock") return "warning";
  return "success";
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.05 } } };

function InventoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [itemsList, setItemsList] = useState(MOCK_ITEMS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const filteredItems = useMemo(() => {
    let items = itemsList;
    if (activeCategory !== "All") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q)
      );
    }
    return items;
  }, [itemsList, search, activeCategory]);

  const stats = useMemo(() => {
    const total = itemsList.length;
    const lowStock = itemsList.filter((i) => i.quantity <= i.minStock && i.quantity > 0).length;
    const totalValue = itemsList.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);
    const cats = new Set(itemsList.map((i) => i.category)).size;
    return { total, lowStock, totalValue, cats };
  }, [itemsList]);

  function handleDelete(item) {
    setDeleteModal({ open: true, item });
  }

  function confirmDelete() {
    setItemsList((prev) => prev.filter((i) => i.id !== deleteModal.item.id));
    toast.success(`"${deleteModal.item.name}" has been deleted.`);
    setDeleteModal({ open: false, item: null });
  }

  const columns = [
    {
      header: "Item Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary mt-0.5 truncate max-w-[200px]">{row.description}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => <Badge variant="info">{row.category}</Badge>,
    },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (row) => (
        <span className={`font-medium ${row.quantity <= row.minStock ? (row.quantity <= row.minStock * 0.5 ? "text-danger" : "text-warning") : "text-success"}`}>
          {row.quantity.toLocaleString()} {UNITS[row.unit]}
        </span>
      ),
    },
    {
      header: "Min Stock",
      accessor: "minStock",
      render: (row) => <span className="text-text-secondary">{row.minStock.toLocaleString()} {UNITS[row.unit]}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const status = getStatus(row);
        return <Badge variant={getStatusVariant(status)} dot>{status}</Badge>;
      },
    },
    {
      header: "Value",
      accessor: "value",
      render: (row) => (
        <span className="font-medium text-text-primary">
          ${(row.quantity * row.costPerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
    },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Inventory Management</h1>
            <p className="text-text-secondary mt-1">Track and manage all factory inventory items</p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/inventory/new")}>
            Add Item
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/10" },
            { label: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
            { label: "Total Value", value: `$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
            { label: "Categories", value: stats.cats, icon: Layers, color: "text-info", bg: "bg-info/10" },
          ].map((stat, idx) => (
            <Card key={idx} hover shadow="sm" padding="md">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search items, suppliers..."
                  className="flex-1 md:max-w-sm"
                />
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter size={16} className="text-text-secondary shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredItems}
              searchable={false}
              pageSize={10}
              actions={(row) => (
                <>
                  <button
                    onClick={() => navigate(`/inventory/${row.id}/edit`)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            />
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Item"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, item: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{deleteModal.item?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default InventoryPage;
