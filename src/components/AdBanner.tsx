import { C } from '../styles/tokens';

interface AdBannerProps {
  /** ID del espacio publicitario opcional de Google AdSense */
  slot?: string;
  style?: React.CSSProperties;
}

/**
 * Componente de espacio publicitario optimizado para Google AdSense.
 * Diseñado con estética Cyberpunk para integrarse limpiamente en la app.
 */
export function AdBanner({ slot = 'default-slot', style }: AdBannerProps) {
  return (
    <div
      style={{
        margin: '14px 0 6px 0',
        padding: '10px 12px',
        background: C.s1,
        border: `1px dashed ${C.b1}`,
        borderRadius: 14,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 65,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 8,
          color: C.t3,
          letterSpacing: 2,
          fontFamily: C.mono,
          textTransform: 'uppercase',
          marginBottom: 4,
          opacity: 0.8,
        }}
      >
        PUBLICIDAD / ESPACIO ADSENSE
      </div>
      {/* Contenedor oficial para script de Google AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 45 }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
