import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-[#F7DD0F]">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="bg-[#F7DD0F] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#F7DD0F]/90 transition-colors inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
