import Button from "./Button";

function EmptyState({
  icon: Icon,
  title = "No data found",
  description,
  action,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon size={32} className="text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
