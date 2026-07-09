import { useEffect, useRef } from 'react';

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
        placeholder="escribe el romaji..."
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        style={{
          background: '#0f0f0f',
          border: '1px solid #2a2a2a',
          borderRadius: 14,
          padding: '18px 20px',
          fontSize: 22,
          fontFamily: "'JetBrains Mono',monospace",
          fontWeight: 600,
          color: '#EAF2E4',
          outline: 'none',
          width: '100%',
          textAlign: 'center',
          letterSpacing: 2,
          caretColor: '#8CF244',
          transition: 'border .18s',
        }}
        onFocus={(e) => (e.target.style.border = '1px solid #8CF244')}
        onBlur={(e) => (e.target.style.border = '1px solid #2a2a2a')}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        style={{
          background: value.trim() ? '#8CF244' : '#1a1a1a',
          color: value.trim() ? '#04000D' : '#444',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          transition: 'all .2s cubic-bezier(.22,1,.36,1)',
          textTransform: 'uppercase',
        }}
      >
        CONFIRMAR
      </button>
    </div>
  );
}
