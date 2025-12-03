'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-[#1a1a18] border-t border-[#3a3a37] py-16 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid md:grid-cols-3 gap-12 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h3 className="text-xl font-serif text-[#d4af37] mb-4 font-light">
              Ogród Pendereckiego
            </h3>
            <p className="text-sm text-[#9a9893] font-light leading-relaxed">
              Wirtualna przestrzeń poświęcona życiu i twórczości Krzysztofa Pendereckiego.
            </p>
          </div>

          <div>
            <h4 className="text-sm text-[#d4af37] mb-4 font-light tracking-wide uppercase">
              Nawigacja
            </h4>
            <ul className="space-y-2">
              {['Dwór mistrza', 'Arboretum', 'Salon muzyczny', 'Amfiteatr'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-[#b8b6b1] hover:text-[#d4af37] transition-colors duration-300 font-light"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm text-[#d4af37] mb-4 font-light tracking-wide uppercase">
              Kontakt
            </h4>
            <p className="text-sm text-[#9a9893] font-light">
              Instytut Adama Mickiewicza
              <br />
              ul. Mokotowska 25
              <br />
              00-560 Warszawa
            </p>
          </div>
        </motion.div>

        <motion.div
          className="pt-8 border-t border-[#3a3a37] flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <p className="text-xs text-[#6b6b6b] font-light mb-4 md:mb-0">
            © {new Date().getFullYear()} Ogród Pendereckiego. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-xs text-[#9a9893] hover:text-[#d4af37] transition-colors duration-300 font-light"
            >
              Polityka prywatności
            </a>
            <a
              href="#"
              className="text-xs text-[#9a9893] hover:text-[#d4af37] transition-colors duration-300 font-light"
            >
              Deklaracja dostępności
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

