import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAddMuralStore } from '@/stores/addMuralStore'
import AddMuralModal from '@/components/murals/AddMuralModal'
import LanguageToggle from '@/components/LanguageToggle'

export default function LandingPage() {
  const { t } = useTranslation()
  const { openModal, isModalOpen } = useAddMuralStore()

  return (
    <div className="min-h-screen bg-kobra-teal overflow-hidden relative">
      {/* Geometric decorative elements */}
      <div className="absolute top-10 left-10 opacity-30">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon points="40,0 80,40 40,80 0,40" fill="#E63946" />
          <polygon points="40,10 70,40 40,70 10,40" fill="#F4A261" />
          <polygon points="40,20 60,40 40,60 20,40" fill="#E9C46A" />
        </svg>
      </div>
      <div className="absolute top-20 right-20 opacity-40">
        <svg width="60" height="70" viewBox="0 0 60 70">
          <polygon points="30,0 60,70 0,70" fill="#9B5DE5" />
          <polygon points="30,15 50,60 10,60" fill="#F15BB5" />
        </svg>
      </div>
      <div className="absolute bottom-32 left-20 opacity-30">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="#457B9D" />
          <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="#2A9D8F" />
        </svg>
      </div>

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle variant="light" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Geometric kaleidoscope logo */}
        <div className="mb-6">
          <svg width="120" height="120" viewBox="0 0 120 120" className="animate-pulse-colors">
            <polygon points="60,10 95,35 95,85 60,110 25,85 25,35" fill="#E63946" />
            <polygon points="60,20 85,40 85,80 60,100 35,80 35,40" fill="#F4A261" />
            <polygon points="60,30 75,45 75,75 60,90 45,75 45,45" fill="#E9C46A" />
            <polygon points="60,40 65,50 65,70 60,80 55,70 55,50" fill="#2A9D8F" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl text-kobra-white text-center mb-4 tracking-wider">
          {t('landing.title')}
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-center mb-8 geometric text-kobra-gradient geometric-underline">
          {t('landing.subtitle')}
        </h2>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-kobra-white/80 text-center max-w-2xl mb-12 font-light">
          {t('landing.description')}{' '}
          <span className="text-kobra-pink">{t('landing.caba')}</span> {t('landing.and')}{' '}
          <span className="text-kobra-green">{t('landing.province')}</span>
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-6">
          <Button
            onClick={openModal}
            className="bg-kobra-pink text-white hover:bg-kobra-pink/90 text-xl px-8 py-6 kobra-border-thick transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <span className="mr-2">+</span>
            {t('landing.addMural')}
          </Button>

          <Link to="/murals">
            <Button
              variant="outline"
              className="bg-transparent text-kobra-white border-kobra-white hover:bg-kobra-white hover:text-kobra-teal text-xl px-8 py-6 border-3 transition-transform hover:translate-x-1 hover:translate-y-1"
            >
              {t('landing.viewMurals')}
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>

        {/* Stats or tagline */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-kobra-white/60">
          <div className="text-center">
            <span className="block text-3xl text-kobra-red geometric">{t('landing.caba')}</span>
            <span className="text-sm uppercase tracking-widest">{t('landing.cabaLabel')}</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl text-kobra-blue geometric">GBA</span>
            <span className="text-sm uppercase tracking-widest">{t('landing.gbaLabel')}</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl text-kobra-purple geometric">FREE</span>
            <span className="text-sm uppercase tracking-widest">{t('landing.freeLabel')}</span>
          </div>
        </div>
      </div>

      {/* Bottom decorative rainbow stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
        <div className="flex-1 bg-kobra-pink"></div>
      </div>

      {/* Geometric pattern corner decoration */}
      <svg className="absolute bottom-10 right-10 w-40 h-40 opacity-20" viewBox="0 0 100 100">
        <polygon points="50,0 100,50 50,100 0,50" fill="#E9C46A" />
        <polygon points="50,15 85,50 50,85 15,50" fill="#2A9D8F" />
        <polygon points="50,30 70,50 50,70 30,50" fill="#9B5DE5" />
        <polygon points="75,25 100,50 75,75" fill="#F15BB5" />
        <polygon points="25,25 0,50 25,75" fill="#E63946" />
      </svg>

      {/* Add Mural Modal */}
      {isModalOpen && <AddMuralModal />}
    </div>
  )
}
