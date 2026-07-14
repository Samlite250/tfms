import { Loader2 } from "lucide-react";

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

function LoadingSpinner({ size = "md", overlay = false, className = "" }) {
  const spinner = (
    <Loader2
      className={`animate-spin text-primary ${sizeMap[size]} ${className}`}
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
