function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = "left",
  className = "",
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-secondary/60
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${Icon && iconPosition === "left" ? "pl-10" : ""}
            ${Icon && iconPosition === "right" ? "pr-10" : ""}
            ${
              error
                ? "border-danger focus:ring-danger/30 focus:border-danger"
                : "border-border focus:ring-primary/30 focus:border-primary"
            }
          `}
          {...rest}
        />
        {Icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <Icon size={18} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
