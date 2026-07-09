import { useState, type CSSProperties, type ReactNode } from 'react';
import { C } from '../styles/tokens';

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Btn({ children, onClick, style = {} }: BtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.accent,
        color: '#04000D',
        border: 'none',
        borderRadius: 12,
        padding: '14px',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.5,
        width: '100%',
        boxShadow: hov
          ? `inset 0 0 20px rgba(255,255,255,.12),0 0 18px rgba(140,242,68,.28)`
          : 'none',
        transition: 'box-shadow .25s cubic-bezier(.22,1,.36,1),transform .15s',
        transform: hov ? 'translateY(-1px)' : 'none',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
