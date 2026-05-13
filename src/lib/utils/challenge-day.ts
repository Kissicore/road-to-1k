// Zona horaria oficial del reto. Todos los cómputos de "qué día es hoy"
// pasan por acá para que servidor y cliente coincidan sin importar dónde
// esté la alumna.
//
// América/Lima = UTC-5 fijo (Perú no observa horario de verano), así que
// 00:00 hora de Lima = 05:00 UTC siempre.
export const CHALLENGE_TIMEZONE = 'America/Lima'
export const CHALLENGE_TZ_LABEL = 'hora de Lima 🇵🇪'
export const CHALLENGE_TZ_SHORT = 'Lima 🇵🇪'
const LIMA_UTC_OFFSET_HOURS = -5

function dateInZone(date: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(date)
}

export function dayNumberFor(
  date: Date,
  startISO: string,
  totalDays: number,
): number | null {
  const todayISO = dateInZone(date, CHALLENGE_TIMEZONE)
  const [y, m, d] = todayISO.split('-').map(Number)
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const todayUTC = Date.UTC(y, m - 1, d)
  const startUTC = Date.UTC(sy, sm - 1, sd)
  const day = Math.floor((todayUTC - startUTC) / 86_400_000) + 1
  if (day < 1 || day > totalDays) return null
  return day
}

// Epoch ms de la próxima medianoche en la zona del reto. Usado por el
// banner para reprogramar el cambio de día al instante exacto.
export function nextMidnightInZone(now: Date = new Date()): number {
  const todayISO = dateInZone(now, CHALLENGE_TIMEZONE)
  const [y, m, d] = todayISO.split('-').map(Number)
  return Date.UTC(y, m - 1, d + 1, -LIMA_UTC_OFFSET_HOURS, 0, 0, 0)
}
