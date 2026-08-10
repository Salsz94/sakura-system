import { useEffect, useRef } from 'react';
import { C } from '../styles/tokens';

interface TypeRomajiInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function TypeRomajiInput({ value, onChange, onSubmit, disabled }: TypeRomajiInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim().length > 0) onSubmit();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder="escribe la lectura..."
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        style={{
          background: C.s1,
          border: `1px solid ${C.b2}`,
          borderRadius: 14,
          padding: '18px 20px',
          fontSize: 22,
          fontFamily: C.mono,
          fontWeight: 600,
          color: C.t1,
          outline: 'none',
          width: '100%',
          textAlign: 'center',
          letterSpacing: 2,
          caretColor: C.accent,
          transition: 'border .18s',
        }}
        onFocus={(e) => (e.target.style.border = `1px solid ${C.cyan}`)}
        onBlur={(e) => (e.target.style.border = `1px solid ${C.b2}`)}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        style={{
          background: value.trim() ? C.accent : C.s2,
          color: value.trim() ? '#FFFFFF' : C.t3,
          border: `1px solid ${value.trim() ? C.accent : C.b1}`,
          borderRadius: 12,
          padding: '14px',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          transition: 'all .2s cubic-bezier(.22,1,.36,1)',
          textTransform: 'uppercase',
          boxShadow: value.trim() ? `0 0 16px rgba(255,0,205,.35)` : 'none',
        }}
      >
        CONFIRMAR
      </button>
    </div>
  );
}
