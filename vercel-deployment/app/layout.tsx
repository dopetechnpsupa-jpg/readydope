import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { GlobalErrorHandler } from "@/components/global-error-handler"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app'),
  title: "DopeTech Nepal - Premium Tech Gear",
  description: "Premium tech gear from DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, and more. Your setup, perfected.",
  keywords: "tech gear, mechanical keyboard, gaming mouse, wireless headphones, Nepal, DopeTech, gaming peripherals, RGB keyboard, wireless mouse",
  authors: [{ name: "DopeTech Nepal" }],
  creator: "DopeTech Nepal",
  publisher: "DopeTech Nepal",
  generator: 'Next.js',
  applicationName: 'DopeTech Nepal',
  referrer: 'origin-when-cross-origin',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DopeTech',
          startupImage: [
      {
        url: '/logo/dopelogo.svg',
        media: '(device-width: 320px) and (device-height: 568px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dopetech-nepal.com',
    title: 'DopeTech Nepal - Premium Tech Gear',
    description: 'Premium tech gear from DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, and more.',
    siteName: 'DopeTech Nepal',
    images: [
      {
        url: '/logo/dopelogo.svg',
        width: 1200,
        height: 630,
        alt: 'DopeTech Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DopeTech Nepal - Premium Tech Gear',
    description: 'Premium tech gear from DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, and more.',
    images: ['/logo/dopelogo.svg'],
    creator: '@dopetech_np',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://dopetech-nepal.com',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'DopeTech',
    'application-name': 'DopeTech Nepal',
    'msapplication-TileColor': '#F7DD0F',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo/dopelogo.svg" as="image" type="image/svg+xml" />

        
        {/* Meta tags for performance */}
        <meta name="theme-color" content="#F7DD0F" />
        <meta name="msapplication-TileColor" content="#F7DD0F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DopeTech" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" href="/logo/dopelogo.svg" />
        <link rel="apple-touch-icon" href="/logo/dopelogo.svg" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body className={plusJakartaSans.className} suppressHydrationWarning={true}>
        <GlobalErrorHandler />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
