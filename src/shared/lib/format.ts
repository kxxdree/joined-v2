export const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`

/** plural(5, ['билет', 'билета', 'билетов']) → «билетов» */
export const plural = (value: number, forms: [string, string, string]) => {
  const lastDigit = value % 10
  const lastTwoDigits = value % 100
  if (lastDigit === 1 && lastTwoDigits !== 11) return forms[0]
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) return forms[1]
  return forms[2]
}

/** 24800 → «24,8K» */
export const compact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.', ',')}K` : String(value)

export const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase()

export const isEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email)
