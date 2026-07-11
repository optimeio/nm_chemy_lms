import logoUrl from '../assets/chemy-logo.png';

export default function BrandLogo({ size = 'default', className = '', showTagline = false }) {
  // size presets: 'sm' for sidebar, 'default' for general, 'lg' for sign-in header
  const sizeMap = {
    sm: { logo: 36, text: 18, gap: 10 },
    default: { logo: 44, text: 22, gap: 12 },
    lg: { logo: 64, text: 32, gap: 14 },
  };

  const dims = sizeMap[size] || sizeMap.default;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-center" style={{ gap: dims.gap }}>
        <img
          src={logoUrl}
          alt="Chemy"
          style={{ width: dims.logo, height: dims.logo, objectFit: 'contain', display: 'block' }}
        />
        <span
          style={{
            fontSize: dims.text,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: 1,
          }}
        >
          Chemy
        </span>
      </div>
      {showTagline && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            marginTop: 6,
            paddingLeft: dims.logo + dims.gap,
          }}
        >
          Building a Thing
        </span>
      )}
    </div>
  );
}
