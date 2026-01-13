import { THEMES, ELEVENLABS_VOICES } from '../../utils/constants';
import { useVoices } from '../../hooks/useVoices';
import type { Settings as SettingsType, ThemeName } from '../../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onUpdate: (settings: Partial<SettingsType>) => void;
}

export function Settings({ isOpen, onClose, settings, onUpdate }: SettingsProps) {
  const { voices } = useVoices();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.5rem' }}>
            ⚙️ Impostazioni
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Settings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Theme */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'var(--text)',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}
            >
              🎨 Tema
            </label>
            <select
              value={settings.theme}
              onChange={(e) => onUpdate({ theme: e.target.value as ThemeName })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '1rem',
              }}
            >
              {Object.entries(THEMES).map(([key, theme]) => (
                <option key={key} value={key}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* TTS Engine */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'var(--text)',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}
            >
              🎤 Motore TTS
            </label>
            <select
              value={settings.ttsEngine}
              onChange={(e) =>
                onUpdate({ ttsEngine: e.target.value as 'browser' | 'elevenlabs' })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '1rem',
              }}
            >
              <option value="browser">Browser (Gratis)</option>
              <option value="elevenlabs">ElevenLabs (Premium)</option>
            </select>
          </div>

          {/* Browser Voice */}
          {settings.ttsEngine === 'browser' && (
            <div>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}
              >
                🗣️ Voce Browser
              </label>
              <select
                value={settings.browserVoice || ''}
                onChange={(e) => onUpdate({ browserVoice: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '1rem',
                }}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ElevenLabs Settings */}
          {settings.ttsEngine === 'elevenlabs' && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  🔑 API Key ElevenLabs
                </label>
                <input
                  type="password"
                  value={settings.elevenLabsKey || ''}
                  onChange={(e) => onUpdate({ elevenLabsKey: e.target.value })}
                  placeholder="sk_..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                  }}
                />
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: '0.5rem 0 0 0',
                  }}
                >
                  Ottieni la tua chiave su{' '}
                  <a
                    href="https://elevenlabs.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)' }}
                  >
                    elevenlabs.io
                  </a>
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  🗣️ Voce ElevenLabs
                </label>
                <select
                  value={settings.elevenLabsVoice || ELEVENLABS_VOICES[0].name}
                  onChange={(e) => onUpdate({ elevenLabsVoice: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                  }}
                >
                  {ELEVENLABS_VOICES.map((voice) => (
                    <option key={voice.id} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* WPM */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'var(--text)',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}
            >
              ⚡ Velocità ({settings.wpm} WPM)
            </label>
            <input
              type="range"
              min="100"
              max="300"
              step="10"
              value={settings.wpm}
              onChange={(e) => onUpdate({ wpm: parseInt(e.target.value) })}
              style={{
                width: '100%',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
              }}
            >
              <span>Lento</span>
              <span>Veloce</span>
            </div>
          </div>

          {/* Auto Advance */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => onUpdate({ autoAdvance: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <span>🔄 Avanza automaticamente alla prossima pagina</span>
            </label>
          </div>

          {/* Highlight */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settings.highlightEnabled}
                onChange={(e) => onUpdate({ highlightEnabled: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <span>✨ Evidenzia parola corrente (karaoke)</span>
            </label>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Salva e chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
