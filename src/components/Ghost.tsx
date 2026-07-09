import type { CSSProperties, ReactNode } from 'react';
import { C } from '../styles/tokens';

interface GhostProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Ghost({ children, onClick, style = {} }: GhostProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: C.t2,
        border: `1px solid ${C.b2}`,
        borderRadius: 10,
        padding: '9px 13px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        transition: 'all .18s',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
