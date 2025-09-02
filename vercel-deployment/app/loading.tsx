export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#F7DD0F] font-semibold mb-2">Loading DopeTech...</p>
        <p className="text-gray-400 text-sm">Connecting to our servers</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
