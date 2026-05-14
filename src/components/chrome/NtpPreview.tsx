import { useRef, useState, useCallback, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Move } from 'lucide-react';
import type { BrowserSettings, ElementPosition, Shortcut } from '../../types';
import { useT } from '../../i18n';

interface NtpPreviewProps {
  settings: BrowserSettings;
  onPositionChange: (key: string, pos: ElementPosition) => void;
}

function hexToRgba(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) || 0;
  const g = parseInt(cleaned.substring(2, 4), 16) || 0;
  const b = parseInt(cleaned.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function getObjectFitStyle(fit: string): React.CSSProperties {
  switch (fit) {
    case 'contain':
      return { objectFit: 'contain' };
    case 'center':
      return { objectFit: 'none', objectPosition: 'center' };
    case 'stretch':
      return { objectFit: 'fill' };
    case 'cover':
    default:
      return { objectFit: 'cover' };
  }
}

function getGradientDirection(direction: string): string {
  switch (direction) {
    case 'to-right':
      return 'to right';
    case 'to-br':
      return '135deg';
    case 'to-tr':
      return '45deg';
    case 'to-bottom':
    default:
      return 'to bottom';
  }
}

function getFontWeight(weight: string): number {
  switch (weight) {
    case 'light':
      return 300;
    case 'bold':
      return 700;
    case 'normal':
    default:
      return 400;
  }
}

function getFontFamily(family: string): string {
  switch (family) {
    case 'serif': return "Georgia, 'Times New Roman', serif";
    case 'mono': return "'Courier New', monospace";
    default: return 'inherit';
  }
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

function isFolder(shortcut: Shortcut): boolean {
  return shortcut.kind === 'folder';
}

function getShortcutColumns(columns: string, shortcutCount: number): number {
  if (columns === 'auto') return Math.min(6, Math.max(1, shortcutCount));
  const parsed = Number.parseInt(columns, 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : 6;
}

function getDefaultShortcutPositions(
  shortcuts: Shortcut[],
  center: ElementPosition,
  columns: string,
  gap: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  const itemsPerRow = getShortcutColumns(columns, shortcuts.length);
  const hSpacing = gap;
  const vSpacing = gap;
  const totalRows = Math.ceil(shortcuts.length / itemsPerRow);

  for (let i = 0; i < shortcuts.length; i++) {
    const row = Math.floor(i / itemsPerRow);
    const col = i % itemsPerRow;
    const itemsInThisRow = Math.min(itemsPerRow, shortcuts.length - row * itemsPerRow);
    const xOffset = (col - (itemsInThisRow - 1) / 2) * hSpacing;
    const yOffset = (row - (totalRows - 1) / 2) * vSpacing;
    positions.push({
      x: Math.max(5, Math.min(95, center.x + xOffset)),
      y: Math.max(5, Math.min(95, center.y + yOffset)),
    });
  }

  return positions;
}

export function NtpPreview({ settings, onPositionChange }: NtpPreviewProps) {
  const t = useT();
  const { theme, layout } = settings;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [clockText, setClockText] = useState('');
  const [dateText, setDateText] = useState('');
  const [failedFavicons, setFailedFavicons] = useState<Set<number>>(new Set());
  const [activeFolderIndex, setActiveFolderIndex] = useState<number | null>(null);

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      let suffix = '';
      if (!theme.clock.format_24h) {
        suffix = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
      }

      let text = `${String(hours).padStart(2, '0')}:${minutes}`;
      if (theme.clock.show_seconds) {
        text += `:${seconds}`;
      }
      text += suffix;

      setClockText(text);

      if (theme.clock.show_date) {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        setDateText(`${y}-${m}-${d}`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [theme.clock.format_24h, theme.clock.show_seconds, theme.clock.show_date]);

  const getPosition = useCallback(
    (e: PointerEvent) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      return { x, y };
    },
    []
  );

  const handlePointerDown = useCallback(
    (key: string) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(key);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const pos = getPosition(e.nativeEvent);
      if (pos) onPositionChange(dragging, pos);
    },
    [dragging, getPosition, onPositionChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const bgUrl = settings.background_image ? convertFileSrc(settings.background_image) : null;

  const bgFilter = `blur(${theme.background.blur}px) brightness(${theme.background.brightness}%)`;

  const elementStyle = (pos: ElementPosition, extra?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    ...extra,
  });

  const dragHandleClass = (key: string) =>
    `group cursor-grab select-none ${dragging === key ? 'cursor-grabbing ring-2 ring-primary/50 rounded-lg' : ''}`;

  const activeFolder = activeFolderIndex !== null ? settings.shortcuts[activeFolderIndex] : null;
  const visibleShortcuts = activeFolder?.kind === 'folder'
    ? activeFolder.children ?? []
    : settings.shortcuts;
  const inFolder = activeFolder?.kind === 'folder';
  const defaultShortcutPositions = settings.show_shortcuts && visibleShortcuts.length > 0
    ? getDefaultShortcutPositions(
        visibleShortcuts,
        layout.shortcuts_position,
        theme.shortcuts.columns,
        theme.shortcuts.gap
      )
    : [];

  const backgroundStyle = theme.background.gradient_enabled
    ? `linear-gradient(${getGradientDirection(theme.background.gradient_direction)}, ${theme.background.gradient_from}, ${theme.background.gradient_to})`
    : theme.background.color || '#202124';

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-border-subtle/50 bg-black shadow-lg select-none"
      style={{ aspectRatio: '16 / 10' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      {bgUrl ? (
        <img
          src={bgUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            ...getObjectFitStyle(theme.background.fit),
            filter: bgFilter,
          }}
          draggable={false}
        />
      ) : (
        <div
          data-testid="ntp-background"
          className="absolute inset-0"
          style={{
            background: backgroundStyle,
            filter: bgFilter,
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: hexToRgba(theme.background.overlay_color, theme.background.overlay_opacity) }}
      />

      {/* Clock */}
      {settings.show_clock && (
        <div
          style={elementStyle(layout.clock_position)}
          className={dragHandleClass('clock_position')}
          onPointerDown={handlePointerDown('clock_position')}
        >
          <div className="relative">
            <div
              className="whitespace-nowrap text-center"
              style={{
                color: theme.clock.color,
                fontSize: `${Math.max(12, theme.clock.size * 0.4)}px`,
                fontWeight: getFontWeight(theme.clock.font_weight),
                fontFamily: getFontFamily(theme.clock.font_family),
                textShadow: `0 2px ${theme.clock.shadow_blur * 0.4}px ${hexToRgba(theme.clock.shadow_color, theme.clock.shadow_opacity)}`,
                letterSpacing: `${theme.clock.letter_spacing}px`,
              }}
            >
              {clockText}
            </div>
            {theme.clock.show_date && (
              <div
                className="text-center whitespace-nowrap"
                style={{
                  color: theme.clock.color,
                  fontSize: `${Math.max(8, theme.clock.size * 0.15)}px`,
                  fontWeight: getFontWeight(theme.clock.font_weight),
                  textShadow: `0 1px ${theme.clock.shadow_blur * 0.2}px ${hexToRgba(theme.clock.shadow_color, theme.clock.shadow_opacity)}`,
                  opacity: 0.8,
                  marginTop: '2px',
                }}
              >
                {dateText}
              </div>
            )}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Move size={12} className="text-white drop-shadow" />
            </div>
          </div>
        </div>
      )}

      {/* Search box */}
      {settings.show_search_box && (
        <div
          style={elementStyle(layout.search_position, { width: '70%', maxWidth: '320px' })}
          className={dragHandleClass('search_position')}
          onPointerDown={handlePointerDown('search_position')}
        >
          <div className="relative">
            <div
              className="flex"
              style={{
                backgroundColor: hexToRgba(theme.search.bg_color, theme.search.bg_opacity),
                borderRadius: `${Math.max(2, theme.search.border_radius * 0.3)}px`,
                padding: `${Math.max(1, theme.search.padding * 0.3)}px ${Math.max(2, theme.search.padding * 0.5)}px`,
                boxShadow: `0 ${theme.search.shadow_blur * 0.1}px ${theme.search.shadow_blur * 0.4}px ${hexToRgba(theme.search.shadow_color, theme.search.shadow_opacity)}`,
                ...(theme.search.border_style !== 'none' ? {
                  border: `${Math.max(1, theme.search.border_width)}px ${theme.search.border_style} ${theme.search.border_color}`,
                } : {}),
                ...(theme.search.backdrop_blur > 0 ? {
                  backdropFilter: `blur(${theme.search.backdrop_blur * 0.4}px)`,
                } : {}),
              }}
            >
              <span className="flex-1 text-[10px] py-0.5" style={{ color: theme.search.text_color }}>
                {theme.search.placeholder || '搜索...'}
              </span>
              <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Move size={12} className="text-white drop-shadow" />
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts - individually draggable */}
      {settings.show_shortcuts && inFolder && (
        <button
          onClick={() => setActiveFolderIndex(null)}
          className="absolute z-20 left-3 top-3 px-2 py-1 rounded bg-black/60 text-white/80 text-[10px] backdrop-blur-sm"
        >
          Back
        </button>
      )}
      {settings.show_shortcuts && visibleShortcuts.map((s, i) => {
        const pos = inFolder ? defaultShortcutPositions[i] : s.position ?? defaultShortcutPositions[i];
        if (!pos) return null;
        const key = `shortcut_position_${i}`;
        const folder = isFolder(s);
        return (
          <div
            key={i}
            style={elementStyle(pos)}
            className={inFolder ? 'select-none' : dragHandleClass(key)}
            onPointerDown={inFolder ? undefined : handlePointerDown(key)}
            onClick={(event) => {
              if (!folder || inFolder) return;
              event.stopPropagation();
              setActiveFolderIndex(i);
            }}
          >
            <div className="relative">
              <div
                className="text-center"
                style={{
                  minWidth: '48px',
                  padding: `${theme.shortcuts.padding_y * 0.2}px ${theme.shortcuts.padding_x * 0.2}px`,
                  backgroundColor: hexToRgba(theme.shortcuts.bg_color, theme.shortcuts.bg_opacity),
                  borderRadius: theme.shortcuts.shape === 'circle' ? '50%' : `${Math.max(2, theme.shortcuts.border_radius * 0.3)}px`,
                  aspectRatio: theme.shortcuts.shape !== 'auto' ? '1' : undefined,
                  boxShadow: theme.shortcuts.shadow_opacity > 0 ? `0 2px ${theme.shortcuts.shadow_blur * 0.3}px ${hexToRgba(theme.shortcuts.shadow_color, theme.shortcuts.shadow_opacity)}` : undefined,
                  ...(theme.shortcuts.border_style !== 'none' ? {
                    border: `${Math.max(1, theme.shortcuts.border_width)}px ${theme.shortcuts.border_style} ${theme.shortcuts.border_color}`,
                  } : {}),
                  ...(theme.shortcuts.backdrop_blur > 0 ? {
                    backdropFilter: `blur(${theme.shortcuts.backdrop_blur * 0.4}px)`,
                  } : {}),
                }}
              >
                <div className="flex justify-center items-center" style={{ height: `${theme.shortcuts.icon_size * 0.3}px` }}>
                  {folder ? (
                    <span style={{ fontSize: `${theme.shortcuts.icon_size * 0.25}px` }}>{s.icon || '📁'}</span>
                  ) : failedFavicons.has(i) || !getFaviconUrl(s.url ?? '') ? (
                    <span style={{ fontSize: `${theme.shortcuts.icon_size * 0.25}px` }}>{s.icon}</span>
                  ) : (
                    <img
                      src={getFaviconUrl(s.url ?? '')}
                      alt=""
                      style={{ width: `${theme.shortcuts.icon_size * 0.3}px`, height: `${theme.shortcuts.icon_size * 0.3}px`, borderRadius: '2px' }}
                      onError={() => setFailedFavicons(prev => new Set(prev).add(i))}
                      draggable={false}
                    />
                  )}
                </div>
                <div className="mt-0.5 truncate max-w-[48px]" style={{ fontSize: '7px', color: theme.shortcuts.title_color }}>
                  {s.title}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Move size={12} className="text-white drop-shadow" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Drag hint */}
      {!dragging && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white/70 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
          {t('preview.dragHint')}
        </div>
      )}
    </div>
  );
}
