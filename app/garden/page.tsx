'use client'

import { useEffect, useState } from 'react'
import { useScroll } from 'framer-motion'
import Navigation from '@/components/garden/Navigation'
import Hero from '@/components/garden/Hero'
import Section from '@/components/garden/Section'
import Footer from '@/components/garden/Footer'
import FilmGrain from '@/components/garden/FilmGrain'

export default function GardenPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50)
    })
    return () => unsubscribe()
  }, [scrollY])

  return (
    <main className="min-h-screen bg-[#1a1a18] text-[#e8e6e1] overflow-x-hidden relative">
      {/* Global Film Grain Overlay */}
      <FilmGrain />
      
      <Navigation isScrolled={isScrolled} />
      
      <Hero />
      
      <Section
        id="dwór-mistrza"
        number="01"
        title="Dwór mistrza"
        subtitle="Poznaj Mistrza od nieznanej strony"
        image="/api/placeholder/800/600"
        content="Krzysztof Penderecki uwielbiał przebywać w zaprojektowanym przez siebie ogrodzie w Lusławicach, któremu poświęcał każdą wolną chwilę. Nasza wirtualna przestrzeń, będąca odwzorowaniem ogrodu Mistrza, łączy w sobie dwie jego największe pasje – muzykę oraz świat flory."
        reverse={false}
      />

      <Section
        id="arboretum"
        number="02"
        title="Arboretum"
        subtitle="Przejdź się po parku projektu Pendereckiego"
        image="/api/placeholder/800/600"
        content="Poznaj jego drzewa, zakamarki i budynki. Ogród Pendereckiego to nie tylko miejsce, ale żywe dzieło sztuki, gdzie każdy element został starannie zaprojektowany i wybrany przez Mistrza."
        reverse={true}
      />

      <Section
        id="salon-muzyczny"
        number="03"
        title="Salon muzyczny"
        subtitle="Posłuchaj utworów maestro"
        image="/api/placeholder/800/600"
        content="Dowiedz się o nich więcej poznając kontekst i anegdoty. Każdy utwór opowiada historię, każda nuta niesie emocje, które Penderecki chciał przekazać światu."
        reverse={false}
      />

      <Footer />
    </main>
  )
}

