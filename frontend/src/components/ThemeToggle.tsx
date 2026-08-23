import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white dark:bg-white/20 text-shield-500 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="Light mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-white dark:bg-white/20 text-shield-500 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="Dark mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'system'
            ? 'bg-white dark:bg-white/20 text-shield-500 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="System preference"
      >
        <Monitor size={16} />
      </button>
    </div>
  )
}
