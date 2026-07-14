const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const shadows = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  bordered = false,
  shadow = "md",
  header,
  footer,
}) {
  return (
    <div
      className={`
        bg-card rounded-2xl overflow-hidden
        ${shadows[shadow]}
        ${bordered ? "border border-border" : ""}
        ${hover ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {header && (
        <div className="px-6 py-4 border-b border-border">
          {header}
        </div>
      )}
      <div className={paddings[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
