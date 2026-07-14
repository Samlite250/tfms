import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  motion,
  useInView,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Users,
  Coffee,
  Factory,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Leaf,
  Menu,
  X,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Database,
  Sprout,
} from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(
          (timestamp - startTime) / (duration * 1000),
          1
        );
        setCount(Math.floor(progress * target));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function TeaLeafSVG({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 20C60 20 20 60 20 100C20 140 60 180 100 180C140 180 180 140 180 100C180 60 140 20 100 20Z"
        fill="url(#leafGrad1)"
        opacity="0.1"
      />
      <path
        d="M100 40C70 40 40 70 40 100C40 130 70 160 100 160C130 160 160 130 160 100C160 70 130 40 100 40Z"
        stroke="#2E7D32"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M100 60 Q80 100 100 140 Q120 100 100 60Z"
        fill="url(#leafGrad2)"
        opacity="0.6"
      />
      <path
        d="M100 70 L100 130"
        stroke="#2E7D32"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M100 90 Q85 80 75 85"
        stroke="#2E7D32"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M100 105 Q115 95 125 100"
        stroke="#2E7D32"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="leafGrad1" x1="20" y1="20" x2="180" y2="180">
          <stop stopColor="#43A047" />
          <stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id="leafGrad2" x1="80" y1="60" x2="120" y2="140">
          <stop stopColor="#43A047" />
          <stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FactorySVG({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="60"
        y="120"
        width="280"
        height="160"
        rx="8"
        fill="#2E7D32"
        opacity="0.08"
      />
      <rect
        x="80"
        y="140"
        width="60"
        height="40"
        rx="4"
        fill="#43A047"
        opacity="0.15"
      />
      <rect
        x="160"
        y="140"
        width="60"
        height="40"
        rx="4"
        fill="#43A047"
        opacity="0.15"
      />
      <rect
        x="240"
        y="140"
        width="60"
        height="40"
        rx="4"
        fill="#43A047"
        opacity="0.15"
      />
      <rect
        x="80"
        y="200"
        width="60"
        height="40"
        rx="4"
        fill="#F9A825"
        opacity="0.12"
      />
      <rect
        x="160"
        y="200"
        width="60"
        height="40"
        rx="4"
        fill="#F9A825"
        opacity="0.12"
      />
      <rect
        x="240"
        y="200"
        width="60"
        height="40"
        rx="4"
        fill="#F9A825"
        opacity="0.12"
      />
      <rect
        x="100"
        y="60"
        width="40"
        height="220"
        rx="4"
        fill="#2E7D32"
        opacity="0.1"
      />
      <rect
        x="260"
        y="80"
        width="30"
        height="200"
        rx="4"
        fill="#2E7D32"
        opacity="0.1"
      />
      <circle
        cx="120"
        cy="50"
        r="20"
        fill="#F9A825"
        opacity="0.2"
      />
      <circle
        cx="275"
        cy="70"
        r="15"
        fill="#F9A825"
        opacity="0.15"
      />
      <path
        d="M100 50 Q110 30 120 20 Q130 30 140 50"
        stroke="#999"
        strokeWidth="2"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M265 65 Q272 50 278 42 Q284 50 290 65"
        stroke="#999"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
      />
      <circle cx="50" cy="180" r="3" fill="#43A047" opacity="0.3" />
      <circle cx="35" cy="200" r="4" fill="#43A047" opacity="0.25" />
      <circle cx="45" cy="220" r="2.5" fill="#43A047" opacity="0.35" />
      <circle cx="355" cy="190" r="3.5" fill="#43A047" opacity="0.3" />
      <circle cx="365" cy="210" r="4.5" fill="#43A047" opacity="0.2" />
      <circle cx="350" cy="230" r="3" fill="#43A047" opacity="0.35" />
      <path
        d="M150 280 L250 280"
        stroke="#2E7D32"
        strokeWidth="2"
        opacity="0.1"
      />
      <path
        d="M130 280 L270 280"
        stroke="#2E7D32"
        strokeWidth="1"
        opacity="0.06"
      />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Users,
    title: "Farmer Management",
    description:
      "Register and manage farmers, track their deliveries and payment history.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Coffee,
    title: "Tea Collection",
    description:
      "Record green leaf deliveries with weight, grade, and receipt tracking.",
    color: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Factory,
    title: "Production",
    description:
      "Manage production batches from raw material to finished products.",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Package,
    title: "Inventory",
    description:
      "Track stock levels for materials, chemicals, fuel, and finished tea.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: ShoppingCart,
    title: "Sales",
    description:
      "Manage customers, create invoices, and track payments.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description:
      "Monitor all factory expenses across categories.",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Generate comprehensive reports with export options.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Manage staff, departments, attendance, and payroll.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const workflowSteps = [
  {
    icon: Sprout,
    title: "Farmer",
    description: "Farmers register and deliver green leaves to the factory.",
    color: "#43A047",
  },
  {
    icon: Coffee,
    title: "Tea Collection",
    description: "Record deliveries, weigh leaves, assign grades.",
    color: "#2E7D32",
  },
  {
    icon: Factory,
    title: "Production",
    description: "Process leaves through production batches.",
    color: "#F9A825",
  },
  {
    icon: Package,
    title: "Inventory",
    description: "Track raw materials and finished goods.",
    color: "#43A047",
  },
  {
    icon: ShoppingCart,
    title: "Sales",
    description: "Create invoices and manage customer orders.",
    color: "#2E7D32",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Analyze performance and generate insights.",
    color: "#F9A825",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Farmers Registered", icon: Users },
  { value: 120, suffix: "+", label: "Employees", icon: Users },
  { value: 50000, suffix: "+", label: "KG Tea Collected", icon: Coffee },
  { value: 10000, suffix: "+", label: "Production Records", icon: Factory },
];

const benefits = [
  "Eliminate manual paperwork and reduce errors",
  "Real-time visibility into all operations",
  "Data-driven decision making",
  "Improved efficiency and productivity",
  "Secure cloud-based data storage",
  "Role-based access for team collaboration",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const workflowRef = useRef(null);
  const statsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const contactInView = useInView(contactRef, { once: true, margin: "-100px" });

  const onSubmit = (data) => {
    setFormSubmitted(true);
    reset();
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TFMS</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollTo(link.href.slice(1))}
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-primary hover:bg-primary-dark px-5 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollTo(link.href.slice(1))}
                  className="block w-full text-left text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 text-center px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-primary text-center px-4 py-2 rounded-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{
          background:
            "linear-gradient(135deg, #F8FAFC 0%, #E8F5E9 30%, #F1F8E9 60%, #F8FAFC 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(46,125,50,0.08) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(46,125,50,0.06) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 80%, rgba(46,125,50,0.08) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(46,125,50,0.08) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />
          <TeaLeafSVG className="absolute top-20 left-10 w-32 h-32 opacity-20" />
          <TeaLeafSVG className="absolute bottom-32 right-16 w-48 h-48 opacity-15" />
          <TeaLeafSVG className="absolute top-1/3 right-1/4 w-24 h-24 opacity-10" />
          <div className="absolute top-1/4 right-10 w-72 h-72 bg-secondary rounded-full blur-[120px] opacity-5" />
          <div className="absolute bottom-1/4 left-20 w-96 h-96 bg-accent rounded-full blur-[150px] opacity-5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              >
                <Sprout className="w-4 h-4" />
                Tea Factory Management System
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Modern Tea{" "}
                <span className="text-primary">Factory</span>{" "}
                Management
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg"
              >
                Streamline your tea factory operations with our comprehensive
                digital management system. From farmer registration to sales
                reporting.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white text-gray-700 px-7 py-3.5 rounded-xl font-semibold text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Login
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap gap-3 mt-10"
              >
                {[
                  { label: "500+ Farmers", icon: Users },
                  { label: "50K+ KG Collected", icon: Coffee },
                  { label: "100% Digital", icon: Zap },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm"
                  >
                    <badge.icon className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-medium text-gray-700">
                      {badge.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={heroInView ? { opacity: 1, scale: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/60 p-8 border border-gray-100">
                  <FactorySVG className="w-full h-auto" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Farmers", value: "500+", color: "text-primary" },
                      { label: "Batches", value: "234", color: "text-accent" },
                      { label: "Revenue", value: "LKR 2M+", color: "text-secondary" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="text-center p-3 bg-gray-50 rounded-xl"
                      >
                        <div className={`text-lg font-bold ${item.color}`}>
                          {item.value}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Manage</span> Your Factory
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A complete suite of tools designed for modern tea factory
              operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={scaleUp}
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      className={`w-6 h-6 ${feature.iconColor}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="workflow"
        ref={workflowRef}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A streamlined process from farmer to final report
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-primary to-accent opacity-20 -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  animate={workflowInView ? "visible" : "hidden"}
                  variants={fadeUp}
                  custom={i}
                  className="relative flex flex-col items-center text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md transition-shadow duration-300 group-hover:shadow-lg"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <step.icon
                      className="w-7 h-7"
                      style={{ color: step.color }}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {i + 1}
                    </div>
                  </motion.div>

                  <h3 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[160px]">
                    {step.description}
                  </p>

                  {i < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4 z-10">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        ref={statsRef}
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />
          <TeaLeafSVG className="absolute top-10 right-20 w-40 h-40 opacity-10" />
          <TeaLeafSVG className="absolute bottom-10 left-20 w-56 h-56 opacity-5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by Factories Across the Region
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Real numbers that demonstrate our platform's impact
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                animate={statsInView ? "visible" : "hidden"}
                variants={scaleUp}
                custom={i}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-sm text-white/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate={aboutInView ? "visible" : "hidden"}
              variants={fadeUp}
            >
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Why TFMS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Digitize Your{" "}
                <span className="text-primary">Tea Factory</span>?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Transform your traditional tea factory operations with modern
                digital tools. Our platform is designed to bring efficiency,
                transparency, and data-driven insights to every aspect of your
                business.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial="hidden"
                    animate={aboutInView ? "visible" : "hidden"}
                    variants={slideRight}
                    custom={i}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate={aboutInView ? "visible" : "hidden"}
              variants={scaleUp}
              custom={2}
              className="relative"
            >
              <div className="absolute inset-0 bg-secondary/5 rounded-3xl transform -rotate-3 scale-105" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Shield,
                      title: "Secure",
                      desc: "Enterprise-grade security for your data",
                      color: "bg-emerald-50",
                      iconColor: "text-emerald-600",
                    },
                    {
                      icon: Clock,
                      title: "Real-time",
                      desc: "Live updates across all modules",
                      color: "bg-blue-50",
                      iconColor: "text-blue-600",
                    },
                    {
                      icon: TrendingUp,
                      title: "Scalable",
                      desc: "Grows with your factory's needs",
                      color: "bg-amber-50",
                      iconColor: "text-amber-600",
                    },
                    {
                      icon: Globe,
                      title: "Cloud-based",
                      desc: "Access from anywhere, anytime",
                      color: "bg-purple-50",
                      iconColor: "text-purple-600",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      variants={scaleUp}
                      custom={i + 3}
                      initial="hidden"
                      animate={aboutInView ? "visible" : "hidden"}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div
                        className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}
                      >
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={contactInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Contact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div
              initial="hidden"
              animate={contactInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
              className="lg:col-span-3"
            >
              {formSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-emerald-700 font-medium">
                    Thank you! Your message has been sent. We'll get back to you
                    soon.
                  </span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      {...register("name", {
                        required: "Name is required",
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    {...register("message", {
                      required: "Message is required",
                    })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Tell us more about your needs..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </motion.div>

            <motion.div
              initial="hidden"
              animate={contactInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={2}
              className="lg:col-span-2 space-y-5"
            >
              {[
                {
                  icon: Mail,
                  title: "Email",
                  value: "info@tfms.com",
                  desc: "We'll respond within 24 hours",
                  color: "bg-emerald-50",
                  iconColor: "text-emerald-600",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  value: "+94 11 234 5678",
                  desc: "Mon - Fri, 8am - 5pm",
                  color: "bg-blue-50",
                  iconColor: "text-blue-600",
                },
                {
                  icon: MapPin,
                  title: "Address",
                  value: "123 Tea Garden Road",
                  desc: "Nuwara Eliya, Sri Lanka",
                  color: "bg-amber-50",
                  iconColor: "text-amber-600",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  variants={scaleUp}
                  custom={i}
                  initial="hidden"
                  animate={contactInView ? "visible" : "hidden"}
                  whileHover={{ y: -2 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md hover:bg-white transition-all duration-300"
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
                  >
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-0.5">
                      {card.title}
                    </h4>
                    <p className="text-sm font-medium text-gray-800">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TFMS</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Modern tea factory management system designed to streamline
                operations from farmer registration to sales reporting.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { name: "Facebook", svg: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                  { name: "Twitter", svg: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                  { name: "LinkedIn", svg: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                  { name: "Instagram", svg: "M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm-4 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.5-7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-300"
                    title={social.name}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={social.svg} /></svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "#home" },
                  { name: "Features", href: "#features" },
                  { name: "About", href: "#about" },
                  { name: "Contact", href: "#contact" },
                ].map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollTo(link.href.slice(1))}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Get Started</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Ready to digitize your tea factory? Get started today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary transition-all shadow-sm hover:shadow-md"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 TFMS. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Leaf className="w-4 h-4 text-secondary" />
              Built for the tea industry
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
