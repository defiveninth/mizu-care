"use client"

import { useI18n } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'minimal' | 'select'
  showFlag?: boolean
  showNativeName?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = false,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, locales, currentLocaleInfo } = useI18n()

  if (variant === 'select') {
    return (
      <Select value={locale} onValueChange={(val) => setLocale(val as typeof locale)}>
        <SelectTrigger className={`w-auto gap-1 ${className ?? ''}`}>
          <SelectValue>
            <span className="flex items-center gap-1.5">
              {showFlag && <span>{currentLocaleInfo.flag}</span>}
              <span>{showNativeName ? currentLocaleInfo.nativeName : locale.toUpperCase()}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {locales.map((loc) => (
            <SelectItem key={loc.code} value={loc.code}>
              <span className="flex items-center gap-2">
                {showFlag && <span>{loc.flag}</span>}
                <span>{showNativeName ? loc.nativeName : loc.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Globe className="h-4 w-4 mr-1" />
            <span className="uppercase text-xs font-semibold">{locale}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc.code}
              onClick={() => setLocale(loc.code)}
              className={locale === loc.code ? 'bg-accent font-medium' : ''}
            >
              {showFlag && <span className="mr-2">{loc.flag}</span>}
              {loc.nativeName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default: dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {showFlag && <span className="mr-2">{currentLocaleInfo.flag}</span>}
          {currentLocaleInfo.nativeName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={locale === loc.code ? 'bg-accent font-medium' : ''}
          >
            {showFlag && <span className="mr-2">{loc.flag}</span>}
            {loc.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
