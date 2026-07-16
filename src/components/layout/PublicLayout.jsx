import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-md shadow-primary/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">COMS</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      <footer className="text-center py-4 text-xs text-text-secondary">
        Coffee Factory Operation Management System
      </footer>
    </div>
  );
}
