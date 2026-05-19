import { cn } from '@/lib/utils/cn'

const CHECKPOINT_DAYS = [14, 28, 42] as const

type Mood = 'idle' | 'soon' | 'today' | 'done'

type Props = {
  todayDay: number | null
}

export function CheckpointMascot({ todayDay }: Props) {
  const { text, mood, cpIndex } = getMessage(todayDay)
  const accent = moodAccent(mood)

  return (
    <div className="card-pop p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
      <div className="float shrink-0">
        <PixelMascot accent={accent} />
      </div>
      <div className="relative flex-1 min-w-0">
        <div
          className="rounded-2xl px-4 py-3 border-2 bg-[var(--color-bg-2)]"
          style={{ borderColor: `${accent}66` }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
            style={{ color: accent }}
          >
            {cpIndex ? `Checkpoint ${cpIndex}` : 'Checkpoints'}
          </p>
          <p className="text-sm sm:text-base font-display font-bold text-[var(--color-ink)] leading-snug">
            {text}
          </p>
        </div>
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -left-[10px]"
          style={{
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `10px solid ${accent}66`,
          }}
        />
      </div>
    </div>
  )
}

function getMessage(today: number | null): {
  text: string
  mood: Mood
  cpIndex: number | null
} {
  if (today === null) {
    return {
      text: '¡Pronto arrancamos! Primer Checkpoint en el día 14.',
      mood: 'idle',
      cpIndex: 1,
    }
  }
  const next = CHECKPOINT_DAYS.find((d) => d >= today)
  if (!next) {
    return {
      text: '¡Completaste los 3 Checkpoints del reto! 🏆',
      mood: 'done',
      cpIndex: null,
    }
  }
  const cpIndex = CHECKPOINT_DAYS.indexOf(next) + 1
  const diff = next - today
  if (diff === 0) {
    return {
      text: `¡Hoy es el Checkpoint ${cpIndex}! Sube tu alcance, interacciones y capturas.`,
      mood: 'today',
      cpIndex,
    }
  }
  if (diff === 1) {
    return {
      text: `¡Mañana toca el Checkpoint ${cpIndex}! Prepara tus capturas.`,
      mood: 'soon',
      cpIndex,
    }
  }
  if (diff <= 3) {
    return {
      text: `Faltan ${diff} días para el Checkpoint ${cpIndex}. ¡Ya casi!`,
      mood: 'soon',
      cpIndex,
    }
  }
  return {
    text: `Faltan ${diff} días para el Checkpoint ${cpIndex}.`,
    mood: 'idle',
    cpIndex,
  }
}

function moodAccent(mood: Mood): string {
  switch (mood) {
    case 'today':
      return '#FF5252'
    case 'soon':
      return '#FFD23F'
    case 'done':
      return '#7EE8FF'
    default:
      return '#FFD23F'
  }
}

function PixelMascot({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 16 18"
      width="64"
      height="72"
      className={cn('block')}
      style={{ imageRendering: 'pixelated' }}
      aria-label="Mascota del reto"
      role="img"
    >
      <rect x="5" y="1" width="6" height="1" fill={accent} />
      <rect x="4" y="2" width="8" height="3" fill={accent} />
      <rect x="6" y="0" width="1" height="2" fill={accent} />
      <rect x="4" y="5" width="8" height="1" fill="#0A0F1F" />
      <rect x="5" y="6" width="6" height="3" fill="#F5C9A5" />
      <rect x="6" y="7" width="1" height="1" fill="#0A0F1F" />
      <rect x="9" y="7" width="1" height="1" fill="#0A0F1F" />
      <rect x="7" y="8" width="2" height="1" fill="#0A0F1F" />
      <rect x="4" y="9" width="8" height="4" fill="#1F8BFF" />
      <rect x="6" y="10" width="4" height="1" fill="#FFFFFF" />
      <rect x="7" y="11" width="2" height="1" fill="#FFFFFF" />
      <rect x="3" y="9" width="1" height="3" fill="#1F8BFF" />
      <rect x="12" y="9" width="1" height="3" fill="#1F8BFF" />
      <rect x="3" y="12" width="1" height="1" fill="#F5C9A5" />
      <rect x="12" y="12" width="1" height="1" fill="#F5C9A5" />
      <rect x="5" y="13" width="2" height="3" fill="#2C5BBF" />
      <rect x="9" y="13" width="2" height="3" fill="#2C5BBF" />
      <rect x="4" y="16" width="3" height="1" fill="#0A0F1F" />
      <rect x="9" y="16" width="3" height="1" fill="#0A0F1F" />
    </svg>
  )
}
