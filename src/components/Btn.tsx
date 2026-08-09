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
        background: `linear-gradient(135deg, ${C.accent}, #D900B2)`,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 12,
        padding: '14px',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.5,
        width: '100%',
        boxShadow: hov
          ? `inset 0 0 20px rgba(255,255,255,.25), 0 0 24px rgba(255,0,205,.55)`
          : '0 0 12px rgba(255,0,205,.28)',
        transition: 'box-shadow .25s cubic-bezier(.22,1,.36,1), transform .15s',
        transform: hov ? 'translateY(-1px)' : 'none',
        textTransform: 'uppercase',
        textShadow: '0 1px 2px rgba(0,0,0,.3)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
