import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  if (type === 'textarea') {
    return (
      <div className={`input-group ${fullWidth ? 'input-full' : ''} ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
          {Icon && <Icon size={16} className="input-icon" />}
          <textarea ref={ref} className="input-field input-textarea" {...props} />
        </div>
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        {Icon && <Icon size={16} className="input-icon" />}
        <input ref={ref} type={type} className="input-field" {...props} />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
