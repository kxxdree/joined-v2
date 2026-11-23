/**
 * Преломление через backdrop-filter: url(#svg-filter) поддерживает только Chromium.
 * В остальных браузерах такое объявление ломает весь backdrop-filter,
 * поэтому эффект включаем классом на <html> только там, где он сработает.
 */
export default defineNuxtPlugin(() => {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? []
  const isChromium = brands.some(b => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand))
  const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches
  if (isChromium && !prefersReducedTransparency) document.documentElement.classList.add('lg-refraction')
})
