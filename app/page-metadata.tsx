import { Metadata } from "next"

export const metadata: Metadata = {
  title: "DopeTech Nepal - Premium Tech Gear & Gaming Peripherals",
  description: "Discover premium tech gear at DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, monitors, and more. Free shipping across Nepal. Your setup, perfected.",
  keywords: "tech gear, mechanical keyboard, gaming mouse, wireless headphones, Nepal, DopeTech, gaming peripherals, RGB keyboard, wireless mouse, gaming setup, tech accessories, computer peripherals",
  openGraph: {
    title: "DopeTech Nepal - Premium Tech Gear & Gaming Peripherals",
    description: "Discover premium tech gear at DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, monitors, and more. Free shipping across Nepal.",
    type: 'website',
    locale: 'en_US',
    url: 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app',
    siteName: 'DopeTech Nepal',
    images: [
      {
        url: '/logo/dopelogo.svg',
        width: 1200,
        height: 630,
        alt: 'DopeTech Nepal - Premium Tech Gear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DopeTech Nepal - Premium Tech Gear & Gaming Peripherals",
    description: "Discover premium tech gear at DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, monitors, and more.",
    images: ['/logo/dopelogo.svg'],
    creator: '@dopetech_np',
  },
  alternates: {
    canonical: 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app',
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
  other: {
    'geo.region': 'NP',
    'geo.placename': 'Nepal',
    'geo.position': '27.7172;85.3240',
    'ICBM': '27.7172, 85.3240',
  },
}
