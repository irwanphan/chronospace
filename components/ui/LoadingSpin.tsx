const LoadingSpin = () => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-screen">
      <div className="w-20 h-20 border-t-2 border-b-2 border-blue-900 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpin;