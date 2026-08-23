import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' }
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('mindshield-language', code)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 
                   text-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 
                   transition-all duration-200 text-sm"
      >
        <Globe size={16} />
        <span>{currentLang.flag} {currentLang.label}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/10 
                        rounded-xl shadow-lg dark:shadow-2xl overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2
                         hover:bg-gray-50 dark:hover:bg-white/10 transition-colors
                         ${lang.code === i18n.language 
                           ? 'bg-shield-50 dark:bg-shield-900/30 text-shield-600 dark:text-shield-400 font-medium' 
                           : 'text-slate-700 dark:text-gray-300'}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
