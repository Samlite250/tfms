import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounce: debounceMs = 300,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  function handleChange(e) {
    const val = e.target.value;
    setLocalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, debounceMs);
  }

  function handleClear() {
    setLocalValue("");
    onChange("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-border bg-white
          pl-10 pr-10 py-2.5 text-sm text-text-primary
          placeholder:text-text-secondary/60
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        "
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
