import React from 'react';
import { C } from '../styles/tokens';

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Colección de Iconos Vectoriales Cyberpunk / HUD
 * Reemplazan los emojis genéricos con elementos geométricos neón.
 */

// 1. Icono de Altavoz / Pronunciación (Audio Tech)
export function CyberSpeaker({ size = 16, color = C.accent, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.54 8.46A5 5 0 0115.54 15.54" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.07 4.93A10 10 0 0119.07 19.07" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 2. Estrella / Destello Didáctico Cyberpunk (4-Point Diamond Spark)
export function CyberStar({ size = 16, color = C.accent, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="#04060F" />
    </svg>
  );
}

// 3. Advertencia / Precaución Cyberpunk (HUD Triangle Badge)
export function CyberCaution({ size = 16, color = C.warn, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path
        d="M12 2L22 20H2L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(255,176,32,.1)"
      />
      <path d="M12 9V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  );
}

// 4. Objetivo / Target Crosshair (HUD Target)
export function CyberTarget({ size = 16, color = C.cyan, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
      <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 5. Mnemotecnia / Cristal de Memoria (Diamond Node)
export function CyberMemory({ size = 16, color = C.accent2, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 3L21 12L12 21L3 12L12 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 7L17 12L12 17L7 12L12 7Z" fill={`${color}33`} stroke={color} strokeWidth="1" />
    </svg>
  );
}

// 6. Onda / Tonalidad Pitch Accent (Frequency Wave)
export function CyberWave({ size = 16, color = C.teal, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M2 12H5L8 4L12 20L16 8L19 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 7. Grilla / Matriz de Tablas (Data Grid)
export function CyberGrid({ size = 16, color = C.t1, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M3 9H21M3 15H21M9 3V21M15 3V21" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
}
