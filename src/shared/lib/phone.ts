export const isRussianPhone = (value: string) => /^7[3489]\d{9}$/.test(value.replace(/\D/g, ''))
