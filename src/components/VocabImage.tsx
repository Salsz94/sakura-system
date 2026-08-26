import { useState } from 'react';

interface VocabImageProps {
  name: string;
  type?: 'vocab' | 'kanji';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renderiza fluidamente una imagen desde /images/vocab/ o /images/kanji/.
 * Si el archivo aún no existe en public/, falla en silencio sin romper la UI.
 */
export function VocabImage({
  name,
  type = 'vocab',
  size = 72,
  className,
  style,
}: VocabImageProps) {
  const [error, setError] = useState(false);

  if (!name || error) return null;

  const clean = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const path = `/images/${type}/${clean}.png`;

  return (
    <img
      src={path}
      alt={name}
      onError={() => setError(true)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 12,
        display: 'inline-block',
        ...style,
      }}
    />
  );
}
