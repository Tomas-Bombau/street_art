import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
]

interface LanguageToggleProps {
  variant?: 'light' | 'dark'
}

export default function LanguageToggle({ variant = 'dark' }: LanguageToggleProps) {
  const { i18n } = useTranslation()

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('language', langCode)
  }

  const baseClasses = 'px-2 py-1 text-xs font-bold transition-colors'
  const activeClasses = variant === 'light'
    ? 'bg-white text-kobra-teal'
    : 'bg-kobra-teal text-white'
  const inactiveClasses = variant === 'light'
    ? 'text-white/70 hover:text-white'
    : 'text-kobra-teal/60 hover:text-kobra-teal'

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`${baseClasses} ${
            i18n.language === lang.code ? activeClasses : inactiveClasses
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
