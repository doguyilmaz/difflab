import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'DiffLab - Compare JSON, YAML, TOML & Code';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const iconBytes = await readFile(join(process.cwd(), 'src/app/apple-icon.png'));
  const iconSrc = `data:image/png;base64,${iconBytes.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <img alt="" src={iconSrc} width={120} height={120} style={{ borderRadius: 24, marginBottom: 32 }} />
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: '#f8fafc',
          letterSpacing: '-0.02em',
        }}
      >
        DiffLab
      </div>
      <div
        style={{
          fontSize: 24,
          color: '#94a3b8',
          marginTop: 12,
        }}
      >
        Compare JSON, YAML, TOML & Code
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 40,
        }}
      >
        {['JSON', 'YAML', 'TOML', 'TypeScript', 'Kotlin', 'Swift'].map((tag) => (
          <div
            key={tag}
            style={{
              fontSize: 16,
              color: '#cbd5e1',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '6px 16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
