export default function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) {
  const baseClass = 'px-6 py-3 rounded-lg font-semibold transition duration-200 text-base';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primaryDark active:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-primaryLight active:bg-primaryLight disabled:opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
