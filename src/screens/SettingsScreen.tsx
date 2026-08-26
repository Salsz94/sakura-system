import { useState, type ReactNode } from 'react';
import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import { isSoundEnabled, setSoundEnabled, playSound } from '../audio/soundManager';
import {
  isNotificationSupported,
  isReminderEnabled,
  setReminderEnabled,
  getReminderTime,
  setReminderTime,
  requestNotificationPermission,
  sendLocalNotification,
} from '../services/notifications';

interface SettingsScreenProps {
  email?: string | null;
  syncing: boolean;
  onBack: () => void;
  onSync: () => void;
  onExport: () => void;
  onReset: () => void;
  onLogout: () => void;
}

interface RowProps {
  title: string;
  desc?: string | null;
  action: ReactNode;
}

interface SectionProps {
  label: string;
  children: ReactNode;
}

// ════════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════════
export function SettingsScreen({
  email,
  syncing,
  onBack,
  onSync,
  onExport,
  onReset,
  onLogout,
}: SettingsScreenProps) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [notifOn, setNotifOn] = useState(isReminderEnabled());
  const [remTime, setRemTime] = useState(getReminderTime());
  const [testSent, setTestSent] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playSound('correct');
  };

  const toggleReminder = async () => {
    if (!notifOn) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifOn(true);
        playSound('correct');
      }
    } else {
      setReminderEnabled(false);
      setNotifOn(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setRemTime(newTime);
    setReminderTime(newTime);
  };

  const handleTestNotif = async () => {
    if (!notifOn) {
      await requestNotificationPermission();
      setNotifOn(true);
    }
    const ok = await sendLocalNotification(
      '🌸 SakiGo — ¡Notificación de Prueba!',
      'Tu concentración te espera en el Dojo. 3 minutos hoy bastan.'
    );
    if (ok) {
      setTestSent(true);
      playSound('correct');
      setTimeout(() => setTestSent(false), 3000);
    }
  };
  const Row = ({ title, desc, action }: RowProps) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '14px 0',
        borderBottom: `1px solid ${C.b1}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{title}</div>
        {desc && (
          <div style={{ fontSize: 10, color: C.t2, marginTop: 2 }}>{desc}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{action}</div>
    </div>
  );

  const Section = ({ label, children }: SectionProps) => (
    <div
      className="fu3"
      style={{
        background: C.s1,
        border: `1px solid ${C.b1}`,
        borderRadius: 16,
        padding: '6px 16px 12px',
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.5,
          color: C.t3,
          textTransform: 'uppercase',
          fontWeight: 700,
          margin: '12px 0 2px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        className="fu"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ fontFamily: C.title, fontSize: 10, letterSpacing: 4, color: C.t3, fontWeight: 600 }}>
          AJUSTES
        </div>
        <Ghost onClick={onBack}>← Volver</Ghost>
      </div>

      <Section label="Cuenta">
        <Row
          title="Email"
          desc={email || 'No has iniciado sesión'}
          action={null}
        />
        <Row
          title="Cerrar sesión"
          desc="Salir de tu cuenta en este dispositivo"
          action={
            <Ghost
              onClick={onLogout}
              style={{ color: C.err, borderColor: 'rgba(255,59,92,.3)' }}
            >
              Salir
            </Ghost>
          }
        />
      </Section>

      <Section label="Preferencias">
        <Row
          title="Sonido"
          desc="Efectos de acierto, fallo y notificaciones"
          action={
            <Ghost
              onClick={toggleSound}
              style={
                soundOn
                  ? { color: C.accent, borderColor: 'rgba(140,242,68,.4)' }
                  : {}
              }
            >
              {soundOn ? 'Activado' : 'Silenciado'}
            </Ghost>
          }
        />
      </Section>

      <Section label="Recordatorios y Notificaciones">
        <Row
          title="Recordatorio Diario"
          desc="Notificación sutil y elegante para mantener tu entrenamiento"
          action={
            <Ghost
              onClick={toggleReminder}
              style={
                notifOn
                  ? { color: C.accent, borderColor: 'rgba(140,242,68,.4)' }
                  : {}
              }
            >
              {notifOn ? '🔔 Activado' : '🔕 Desactivado'}
            </Ghost>
          }
        />
        {notifOn && (
          <Row
            title="Hora de Estudio"
            desc="Elige la hora del día en que prefieres recibir el aviso"
            action={
              <input
                type="time"
                value={remTime}
                onChange={handleTimeChange}
                style={{
                  background: C.s2,
                  border: `1px solid ${C.b2}`,
                  color: C.accent,
                  fontFamily: C.mono,
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 8,
                  outline: 'none',
                }}
              />
            }
          />
        )}
        <Row
          title="Probar Notificación"
          desc="Envía una notificación de prueba en este dispositivo"
          action={
            <Ghost onClick={handleTestNotif}>
              {testSent ? '✓ Enviada' : 'Probar'}
            </Ghost>
          }
        />
      </Section>

      <Section label="Sincronización">
        <Row
          title="Sincronizar ahora"
          desc="Vuelve a cargar tu progreso desde la nube"
          action={
            <Ghost onClick={onSync}>{syncing ? 'Sincronizando…' : 'Sincronizar'}</Ghost>
          }
        />
        <Row
          title="Exportar progreso"
          desc="Descarga un respaldo JSON de tu avance y maestría"
          action={<Ghost onClick={onExport}>Exportar</Ghost>}
        />
      </Section>

      <Section label="Zona de peligro">
        <Row
          title="Reiniciar progreso"
          desc="Borra XP, lecciones, exámenes, racha y maestría. Irreversible."
          action={
            <Ghost
              onClick={onReset}
              style={{ color: C.err, borderColor: 'rgba(255,59,92,.3)' }}
            >
              Reiniciar
            </Ghost>
          }
        />
      </Section>

      <div
        style={{
          textAlign: 'center',
          fontSize: 9,
          color: C.t3,
          fontFamily: C.mono,
          letterSpacing: 1,
          marginTop: 4,
        }}
      >
        Sakura System · v1.0
      </div>
    </div>
  );
}
