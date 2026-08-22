import './Card.css';

export default function Card({
  children,
  onClick,
  hoverable = false,
  className = '',
  padding = true,
  ...props
}) {
  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${padding ? 'card-padded' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
