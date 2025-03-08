interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`bg-white p-4 rounded-lg 
      transition-all duration-300
      border border-gray-200 relative
      hover:border-blue-500 focus:border-blue-500
      hover:drop-shadow-[0_5px_4px_rgba(0,0,168,0.15)] focus:drop-shadow-[0_5px_4px_rgba(0,0,168,0.15)]
    ${className}`}>
      {children}
    </div>
  );
};

export default Card;