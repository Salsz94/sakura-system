import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Última línea de defensa: si cualquier pantalla lanza una excepción al
 * renderizar, esto evita que toda la app se caiga a blanco. Es deliberadamente
 * independiente de App.tsx (estilos propios) para seguir funcionando incluso
 * si el módulo principal está roto.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Render falló:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#04000D',
          color: '#EAF2E4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 22 20H2L12 3Z"
            stroke="#FF3B5C"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 9.5v5" stroke="#FF3B5C" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="17" r="0.9" fill="#FF3B5C" />
        </svg>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Algo salió mal en el dojo
        </div>
        <div style={{ fontSize: 12, color: '#8A9484', maxWidth: 320 }}>
          Tu progreso ya guardado no se pierde. Recarga para continuar.
        </div>
        <button
          onClick={this.handleReload}
          style={{
            background: '#8CF244',
            color: '#04000D',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '0 0 24px 2px rgba(140,242,68,.3)',
          }}
        >
          Recargar
        </button>
      </div>
    );
  }
}
