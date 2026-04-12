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

function getDefaultShortcutPositions(shortcuts: Shortcut[], center: ElementPosition): ElementPosition[] {
  const positions: ElementPosition[] = [];
  const itemsPerRow = 6;
  const hSpacing = 8;
  const vSpacing = 10;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [clockText, setClockText] = useState('');
  const [dateText, setDateText] = useState('');
  const [failedFavicons, setFailedFavicons] = useState<Set<number>>(new Set());

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      let suffix = '';
      if (!settings.clock_format_24h) {
        suffix = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
      }

      let text = `${String(hours).padStart(2, '0')}:${minutes}`;
      if (settings.clock_show_seconds) {
        text += `:${seconds}`;
      }
      text += suffix;

      setClockText(text);

      if (settings.clock_show_date) {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        setDateText(`${y}-${m}-${d}`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [settings.clock_format_24h, settings.clock_show_seconds, settings.clock_show_date]);

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

  const bgFilter = `blur(${settings.background_blur}px) brightness(${settings.background_brightness}%)`;

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

  const defaultShortcutPositions = settings.show_shortcuts && settings.shortcuts.length > 0
    ? getDefaultShortcutPositions(settings.shortcuts, settings.shortcuts_position)
    : [];

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
            ...getObjectFitStyle(settings.background_fit),
            filter: bgFilter,
          }}
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: settings.background_color || '#202124',
            filter: bgFilter,
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: hexToRgba(settings.overlay_color, settings.overlay_opacity) }}
      />

      {/* Clock */}
      {settings.show_clock && (
        <div
          style={elementStyle(settings.clock_position)}
          className={dragHandleClass('clock_position')}
          onPointerDown={handlePointerDown('clock_position')}
        >
          <div className="relative">
            <div
              className="whitespace-nowrap text-center"
              style={{
                color: settings.clock_color,
                fontSize: `${Math.max(12, settings.clock_size * 0.4)}px`,
                fontWeight: getFontWeight(settings.clock_font_weight),
                fontFamily: getFontFamily(settings.clock_font_family),
                textShadow: `0 2px ${settings.clock_shadow_blur * 0.4}px ${hexToRgba(settings.clock_shadow_color, settings.clock_shadow_opacity)}`,
                letterSpacing: `${settings.clock_letter_spacing}px`,
              }}
            >
              {clockText}
            </div>
            {settings.clock_show_date && (
              <div
                className="text-center whitespace-nowrap"
                style={{
                  color: settings.clock_color,
                  fontSize: `${Math.max(8, settings.clock_size * 0.15)}px`,
                  fontWeight: getFontWeight(settings.clock_font_weight),
                  textShadow: `0 1px ${settings.clock_shadow_blur * 0.2}px ${hexToRgba(settings.clock_shadow_color, settings.clock_shadow_opacity)}`,
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
          style={elementStyle(settings.search_position, { width: '70%', maxWidth: '320px' })}
          className={dragHandleClass('search_position')}
          onPointerDown={handlePointerDown('search_position')}
        >
          <div className="relative">
            <div
              className="flex"
              style={{
                backgroundColor: hexToRgba(settings.search_bg_color, settings.search_bg_opacity),
                borderRadius: `${Math.max(2, settings.search_border_radius * 0.3)}px`,
                padding: `${Math.max(1, settings.search_padding * 0.3)}px ${Math.max(2, settings.search_padding * 0.5)}px`,
                boxShadow: `0 ${settings.search_shadow_blur * 0.1}px ${settings.search_shadow_blur * 0.4}px ${hexToRgba(settings.search_shadow_color, settings.search_shadow_opacity)}`,
                ...(settings.search_border_style !== 'none' ? {
                  border: `${Math.max(1, settings.search_border_width)}px ${settings.search_border_style} ${settings.search_border_color}`,
                } : {}),
                ...(settings.search_backdrop_blur > 0 ? {
                  backdropFilter: `blur(${settings.search_backdrop_blur * 0.4}px)`,
                } : {}),
              }}
            >
              <span className="flex-1 text-[10px] py-0.5" style={{ color: settings.search_text_color }}>
                {settings.search_placeholder || '搜索...'}
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
      {settings.show_shortcuts && settings.shortcuts.map((s, i) => {
        const pos = s.position ?? defaultShortcutPositions[i];
        if (!pos) return null;
        const key = `shortcut_position_${i}`;
        return (
          <div
            key={i}
            style={elementStyle(pos)}
            className={dragHandleClass(key)}
            onPointerDown={handlePointerDown(key)}
          >
            <div className="relative">
              <div
                className="text-center"
                style={{
                  minWidth: '48px',
                  padding: `${settings.shortcuts_padding_y * 0.2}px ${settings.shortcuts_padding_x * 0.2}px`,
                  backgroundColor: hexToRgba(settings.shortcuts_bg_color, settings.shortcuts_bg_opacity),
                  borderRadius: settings.shortcuts_shape === 'circle' ? '50%' : `${Math.max(2, settings.shortcuts_border_radius * 0.3)}px`,
                  aspectRatio: settings.shortcuts_shape !== 'auto' ? '1' : undefined,
                  boxShadow: settings.shortcuts_shadow_opacity > 0 ? `0 2px ${settings.shortcuts_shadow_blur * 0.3}px ${hexToRgba(settings.shortcuts_shadow_color, settings.shortcuts_shadow_opacity)}` : undefined,
                  ...(settings.shortcuts_border_style !== 'none' ? {
                    border: `${Math.max(1, settings.shortcuts_border_width)}px ${settings.shortcuts_border_style} ${settings.shortcuts_border_color}`,
                  } : {}),
                  ...(settings.shortcuts_backdrop_blur > 0 ? {
                    backdropFilter: `blur(${settings.shortcuts_backdrop_blur * 0.4}px)`,
                  } : {}),
                }}
              >
                <div className="flex justify-center items-center" style={{ height: `${settings.shortcuts_icon_size * 0.3}px` }}>
                  {failedFavicons.has(i) ? (
                    <span style={{ fontSize: `${settings.shortcuts_icon_size * 0.25}px` }}>{s.icon}</span>
                  ) : (
                    <img
                      src={getFaviconUrl(s.url)}
                      alt=""
                      style={{ width: `${settings.shortcuts_icon_size * 0.3}px`, height: `${settings.shortcuts_icon_size * 0.3}px`, borderRadius: '2px' }}
                      onError={() => setFailedFavicons(prev => new Set(prev).add(i))}
                      draggable={false}
                    />
                  )}
                </div>
                <div className="mt-0.5 truncate max-w-[48px]" style={{ fontSize: '7px', color: settings.shortcuts_title_color }}>
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
