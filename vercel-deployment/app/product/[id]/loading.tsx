export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#F7DD0F] font-semibold">Loading Product...</p>
      </div>
    </div>
  );
}
