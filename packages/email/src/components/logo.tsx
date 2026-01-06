import { Img, Section } from "@react-email/components";

interface LogoProps {
  logoUrl?: string;
  companyName?: string;
  width?: number;
  height?: number;
}

export function Logo({
  logoUrl,
  companyName = "BaseOne",
  width = 40,
  height = 40,
}: LogoProps) {
  // Default fallback logo (simple text-based logo)
  const defaultLogo = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#000"/>
      <text x="20" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">B1</text>
    </svg>
  `).toString('base64')}`;

  // CSS-blended version for automatic dark mode adaptation
  return (
    <Section className="mt-[32px]">
      <style>{`
          .logo-blend {
            filter: none;
          }
          
          /* Regular dark mode - exclude Outlook.com and disable-dark-mode class */
          @media (prefers-color-scheme: dark) {
            .logo-blend:not([class^="x_"]):not(.disable-dark-mode .logo-blend) {
              filter: invert(1) brightness(1);
            }
          }
          
          /* Outlook.com specific dark mode targeting - but not when dark mode is disabled */
          [data-ogsb]:not(.disable-dark-mode) .logo-blend,
          [data-ogsc]:not(.disable-dark-mode) .logo-blend,
          [data-ogac]:not(.disable-dark-mode) .logo-blend,
          [data-ogab]:not(.disable-dark-mode) .logo-blend {
            filter: invert(1) brightness(1);
          }
          
          /* Force no filter when dark mode is disabled */
          .disable-dark-mode .logo-blend {
            filter: none !important;
          }
        `}</style>

      <Img
        src={logoUrl || defaultLogo}
        width={width.toString()}
        height={height.toString()}
        alt={companyName}
        className="my-0 mx-auto block logo-blend"
      />
    </Section>
  );
}