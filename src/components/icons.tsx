import type { SVGProps } from "react";

// The company mark: a burst of dots around a centre, the same mark as the site icon (src/app/icon.svg).
const LOGO_DOTS: [cx: number, cy: number, r: number][] = [
  [32, 32, 7],
  [32, 16, 5],
  [47, 17, 4],
  [48, 32, 5],
  [17, 17, 4],
  [19, 5, 3],
  [19, 59, 3],
  [32, 3, 3],
  [32, 61, 3],
  [45, 5, 3],
  [45, 59, 3],
  [59, 19, 3],
  [5, 19, 3],
  [61, 32, 3],
  [3, 32, 3],
  [59, 45, 3],
  [5, 45, 3],
  [16, 32, 5],
  [17, 47, 4],
  [32, 48, 5],
  [47, 47, 4],
];

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <g fill="currentColor">
        {LOGO_DOTS.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

// WhatsApp glyph from Simple Icons (CC0).
export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M13.5 8h-11M7 3.5 2.5 8 7 12.5" />
    </svg>
  );
}

// Leading icons for the search fields on phones, where the field labels are hidden

export function DepartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="8" cy="8" r="5.25" />
      <circle cx="8" cy="8" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...props}>
      <path d="M8 14.25s4.75-4.1 4.75-7.75a4.75 4.75 0 0 0-9.5 0c0 3.65 4.75 7.75 4.75 7.75Z" />
      <circle cx="8" cy="6.5" r="1.6" />
    </svg>
  );
}

export function MapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...props}>
      <path d="M1.75 3.75 5.5 2.25l5 1.5 3.75-1.5v10l-3.75 1.5-5-1.5-3.75 1.5v-10Z" />
      <path d="M5.5 2.25v10M10.5 3.75v10" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" />
      <path d="M2.25 6.75h11.5M5.5 1.75v2.5M10.5 1.75v2.5" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.75V8l2.25 1.5" />
    </svg>
  );
}

export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" {...props}>
      <circle cx="8" cy="5" r="3" />
      <path d="M2.25 14c.4-3 2.75-4.75 5.75-4.75S13.35 11 13.75 14H2.25Z" />
    </svg>
  );
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...props}>
      <path d="M2.25 10.75V8.6c0-.4.12-.8.34-1.13L4.1 5.2c.28-.42.75-.7 1.25-.7h5.3c.5 0 .97.28 1.25.7l1.5 2.27c.23.34.35.73.35 1.13v2.15" />
      <path d="M1.75 10.75h12.5v1.5h-12.5zM2.6 7.75h10.8" />
      <circle cx="4.75" cy="12.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="11.25" cy="12.75" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

