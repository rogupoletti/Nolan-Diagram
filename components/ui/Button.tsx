import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, ...props }) => {
  const baseClasses = 'px-6 py-3 text-base font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-blue-500',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${props.className || ''}`;

  return (
    <button {...props} className={finalClassName}>
      {children}
    </button>
  );
};

export default Button;