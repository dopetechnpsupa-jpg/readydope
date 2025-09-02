import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface HeroImage {
  id: number
  image_url: string
  title: string
  subtitle: string
  description: string
  is_active: boolean
  display_order: number
  show_content: boolean
}

interface CarouselSlide {
  id: number
  image: string
  header: string
  description: string
  link?: string
  showContent: boolean
}

export function useHeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHeroImages() {
      try {
        setLoading(true)
        setError(null)

        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        })

        const supabasePromise = supabase
          .from('hero_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        const { data, error: fetchError } = await Promise.race([supabasePromise, timeoutPromise]) as any

        if (fetchError) {
          throw fetchError
        }

        if (data && data.length > 0) {
          const formattedSlides: CarouselSlide[] = (data as unknown as HeroImage[])
            .map((hero: HeroImage) => ({
              id: hero.id,
              image: hero.image_url,
              header: hero.title || `Hero Image ${hero.id}`,
              description: hero.description || hero.subtitle || 'Discover the latest in gaming and professional equipment.',
              link: (hero as any).button_link || undefined,
              showContent: hero.show_content !== false
            }))
          
          setSlides(formattedSlides)
        } else {
          // Fallback to default slides if no hero images found
          setSlides([
            {
              id: 1,
              image: '/products/keyboard.png',
              header: 'Premium Gaming Keyboards',
              description: 'Experience ultimate precision and performance with our collection of high-end mechanical keyboards designed for gamers and professionals.',
              link: '/product/1',
              showContent: true
            },
            {
              id: 2,
              image: '/products/key.png',
              header: 'Ergonomic Gaming Mice',
              description: 'Dominate your games with precision-engineered mice featuring advanced sensors and customizable RGB lighting.',
              link: '/product/2',
              showContent: true
            },
            {
              id: 3,
              image: '/products/Screenshot 2025-08-02 215007.png',
              header: 'Immersive Audio Experience',
              description: 'Crystal clear sound and premium comfort with our selection of gaming headsets and professional audio equipment.',
              link: '/product/3',
              showContent: true
            },
            {
              id: 4,
              image: '/products/Screenshot 2025-08-02 215024.png',
              header: 'Studio-Quality Speakers',
              description: 'Transform your setup with powerful speakers that deliver rich, detailed sound for music, gaming, and entertainment.',
              link: '/product/4',
              showContent: true
            }
          ])
        }
      } catch (err) {
        console.error('Error fetching hero images:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch hero images')
        
        // Fallback to default slides on error
        setSlides([
          {
            id: 1,
            image: '/products/keyboard.png',
            header: 'Premium Gaming Keyboards',
            description: 'Experience ultimate precision and performance with our collection of high-end mechanical keyboards designed for gamers and professionals.',
            link: '/product/1',
            showContent: true
          },
          {
            id: 2,
            image: '/products/key.png',
            header: 'Ergonomic Gaming Mice',
            description: 'Dominate your games with precision-engineered mice featuring advanced sensors and customizable RGB lighting.',
            link: '/product/2',
            showContent: true
          },
          {
            id: 3,
            image: '/products/Screenshot 2025-08-02 215007.png',
            header: 'Immersive Audio Experience',
            description: 'Crystal clear sound and premium comfort with our selection of gaming headsets and professional audio equipment.',
            link: '/product/3',
            showContent: true
          },
          {
            id: 4,
            image: '/products/Screenshot 2025-08-02 215024.png',
            header: 'Studio-Quality Speakers',
            description: 'Transform your setup with powerful speakers that deliver rich, detailed sound for music, gaming, and entertainment.',
            link: '/product/4',
            showContent: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHeroImages()
  }, [])

  return { slides, loading, error }
}
