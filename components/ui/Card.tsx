interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`bg-white p-4 rounded-lg 
      transition-all duration-300
      border border-gray-200 relative
      group
      hover:border-blue-500 focus:border-blue-500
      hover:drop-shadow-[0_5px_4px_rgba(0,0,168,0.15)] focus:drop-shadow-[0_5px_4px_rgba(0,0,168,0.15)]
      hover:-mt-[1px] hover:mb-[1px] focus:-mt-[1px] focus:mb-[1px]
    ${className}`}>
      {children}
    </div>
  );
};

export default Card;