interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`bg-white p-4 rounded-lg 
      border border-gray-200 relative
      hover:shadow-md transition-all duration-300
    ${className}`}>
      {children}
    </div>
  );
};

export default Card;