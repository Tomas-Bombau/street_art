import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageToggle from '@/components/LanguageToggle'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-kobra-teal flex flex-col items-center justify-center px-4 relative">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="light" />
      </div>

      {/* Geometric decoration */}
      <div className="mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon points="40,0 80,40 40,80 0,40" fill="#E63946" />
          <polygon points="40,10 70,40 40,70 10,40" fill="#F4A261" />
          <polygon points="40,20 60,40 40,60 20,40" fill="#E9C46A" />
          <polygon points="40,30 50,40 40,50 30,40" fill="#2A9D8F" />
        </svg>
      </div>

      {/* 404 */}
      <h1 className="text-9xl text-kobra-white mb-4 text-kobra-gradient">{t('notFound.title')}</h1>

      {/* Message */}
      <p className="text-2xl text-kobra-white/80 mb-8 geometric">
        {t('notFound.message')}
      </p>

      {/* Decorative geometric text */}
      <div className="text-kobra-pink text-xl mb-8 opacity-60 geometric-underline">
        {t('notFound.subtitle')}
      </div>

      {/* Back button */}
      <Link to="/">
        <Button className="bg-kobra-pink text-white hover:bg-kobra-pink/90 text-lg px-6 py-4 kobra-border">
          ← {t('notFound.backHome')}
        </Button>
      </Link>

      {/* Bottom rainbow stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
        <div className="flex-1 bg-kobra-pink"></div>
      </div>
    </div>
  )
}
