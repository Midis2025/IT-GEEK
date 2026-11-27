import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

/* ── Map geometry ─────────────────────────────────────────────────────────────────────────────
   The outline is a simplified coastline traced from real longitude/latitude points and projected with the same
   equirectangular projection as the city markers, so every marker sits at its true position on the outline.
   Everything is computed at build time (server component) — no map library and no client JavaScript. */

type LonLat = readonly [lon: number, lat: number];

const LON0 = 113;
const LAT0 = -10.5;
const SCALE = 20; // viewBox units per degree of latitude
const LON_SCALE = SCALE * Math.cos((26 * Math.PI) / 180); // shrink longitude at Australia's mid-latitude
const PAD_X = 40;
const PAD_Y = 30;
const VIEW_W = 850;
const VIEW_H = 730;

const project = ([lon, lat]: LonLat) => ({ x: PAD_X + (lon - LON0) * LON_SCALE, y: PAD_Y + (LAT0 - lat) * SCALE });

/** Closed Catmull-Rom spline through the projected points, as cubic Bézier segments. */
function smoothPath(points: readonly LonLat[]) {
  const p = points.map(project);
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(p[0].x)} ${f(p[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return `${d}Z`;
}

// Mainland, clockwise from Cape York.
const MAINLAND: LonLat[] = [
  [142.5, -10.7], [142.75, -11.1], [143.0, -11.8], [143.3, -12.4], [143.5, -13.0], [143.6, -13.8], [144.0, -14.35],
  [144.5, -14.15], [144.9, -14.6], [145.25, -15.47], [145.45, -16.3], [145.8, -16.9], [146.05, -17.5], [146.1, -18.2],
  [146.35, -18.8], [146.8, -19.25], [147.5, -19.45], [148.25, -20.0], [148.75, -20.55], [149.2, -21.1], [149.5, -21.6],
  [150.0, -22.1], [150.75, -22.55], [150.85, -23.2], [151.3, -23.8], [151.8, -24.1], [152.4, -24.75], [152.95, -25.25],
  [153.25, -24.8], [153.3, -25.5], [153.1, -26.3], [153.15, -26.9], [153.45, -27.4], [153.5, -28.1], [153.64, -28.64],
  [153.35, -29.4], [153.15, -30.3], [153.0, -30.95], [152.9, -31.5], [152.55, -32.2], [152.2, -32.7], [151.8, -32.95],
  [151.5, -33.4], [151.3, -33.85], [150.95, -34.4], [150.75, -35.1], [150.25, -35.65], [150.15, -36.25],
  [149.95, -37.05], [149.98, -37.5], [149.3, -37.8], [148.0, -37.88], [147.2, -38.4], [146.4, -39.1], [145.9, -38.75],
  [145.3, -38.55], [144.65, -38.3], [144.3, -38.35], [143.5, -38.85], [142.5, -38.4], [141.6, -38.35], [140.97, -38.05],
  [139.75, -37.17], [139.4, -36.4], [138.9, -35.6], [138.25, -35.62], [138.45, -35.2], [138.5, -34.85], [138.2, -34.3],
  [137.9, -34.6], [137.75, -35.1], [136.9, -35.25], [137.45, -34.85], [137.6, -34.0], [137.95, -33.25],
  [137.77, -32.5], [137.55, -33.05], [136.95, -33.7], [136.15, -34.35], [135.85, -34.8], [135.5, -34.6],
  [135.2, -34.05], [134.8, -33.4], [134.2, -32.75], [133.7, -32.1], [132.45, -31.95], [131.1, -31.5], [129.8, -31.6],
  [128.9, -31.7], [127.5, -32.2], [126.3, -32.25], [124.9, -32.8], [123.9, -33.6], [123.2, -33.95], [121.9, -33.86],
  [120.1, -33.95], [119.4, -34.4], [117.9, -35.05], [116.7, -35.0], [115.14, -34.37], [115.0, -33.6], [115.6, -33.3],
  [115.7, -32.5], [115.75, -31.95], [115.3, -31.0], [115.05, -30.3], [114.9, -29.25], [114.6, -28.8], [114.15, -27.7],
  [113.55, -26.6], [113.2, -26.15], [113.55, -25.6], [113.65, -24.88], [113.4, -24.2], [113.6, -23.4], [113.8, -22.6],
  [114.15, -21.8], [115.1, -21.65], [116.7, -20.6], [117.6, -20.6], [118.6, -20.3], [119.5, -19.95], [120.5, -19.6],
  [121.3, -19.1], [121.8, -18.5], [122.2, -17.95], [122.3, -17.2], [122.95, -16.4], [123.75, -16.8], [124.4, -16.1],
  [125.1, -15.1], [125.6, -14.45], [126.2, -13.95], [126.9, -13.75], [127.5, -14.1], [127.85, -14.55], [128.15, -15.15],
  [128.4, -14.8], [129.3, -14.9], [129.6, -14.55], [129.45, -14.05], [129.8, -13.5], [130.2, -13.2], [130.4, -12.7],
  [130.85, -12.35], [131.3, -12.15], [132.1, -11.35], [132.65, -11.6], [133.4, -11.8], [134.0, -12.05],
  [135.0, -12.15], [136.0, -11.95], [136.85, -12.25], [136.6, -12.9], [136.0, -13.2], [135.6, -13.65],
  [135.55, -14.55], [135.4, -15.0], [136.3, -15.5], [137.0, -15.9], [138.0, -16.6], [139.3, -17.4], [140.4, -17.65],
  [140.83, -17.48], [141.3, -16.5], [141.5, -15.3], [141.6, -14.0], [141.75, -13.2], [141.85, -12.6], [142.0, -11.9],
  [142.2, -11.1],
];

const TASMANIA: LonLat[] = [
  [144.7, -40.7], [145.3, -40.76], [146.35, -41.15], [147.0, -41.05], [147.4, -40.98], [148.0, -40.75], [148.3, -41.3],
  [148.3, -41.9], [148.25, -42.25], [147.95, -42.75], [147.9, -43.15], [147.35, -43.1], [146.8, -43.62],
  [146.0, -43.6], [145.85, -43.25], [145.25, -42.25], [144.8, -41.6],
];

const KANGAROO_ISLAND: LonLat[] = [
  [136.55, -35.75], [137.0, -35.6], [137.6, -35.6], [138.1, -35.65], [137.8, -35.85], [137.2, -36.05], [136.7, -36.05],
];

const TIWI_ISLANDS: LonLat[] = [[130.0, -11.75], [130.4, -11.25], [131.0, -11.25], [131.5, -11.45], [131.3, -11.85], [130.6, -11.85]];

const LAND_PATHS = [MAINLAND, TASMANIA, KANGAROO_ISLAND, TIWI_ISLANDS].map(smoothPath);

type City = {
  name: string;
  state: string;
  stateName: string;
  coords: LonLat;
  /** Label placement relative to the marker, chosen so no two labels overlap. */
  label: { dx: number; dy: number; anchor: "start" | "end" | "middle" };
};

const cities: City[] = [
  { name: "Sydney", state: "NSW", stateName: "New South Wales", coords: [151.21, -33.87], label: { dx: 16, dy: 6, anchor: "start" } },
  { name: "Melbourne", state: "VIC", stateName: "Victoria", coords: [144.96, -37.81], label: { dx: -16, dy: 6, anchor: "end" } },
  { name: "Brisbane", state: "QLD", stateName: "Queensland", coords: [153.03, -27.47], label: { dx: -16, dy: 6, anchor: "end" } },
  { name: "Perth", state: "WA", stateName: "Western Australia", coords: [115.86, -31.95], label: { dx: 16, dy: 6, anchor: "start" } },
  { name: "Adelaide", state: "SA", stateName: "South Australia", coords: [138.6, -34.93], label: { dx: 16, dy: 6, anchor: "start" } },
  { name: "Canberra", state: "ACT", stateName: "Australian Capital Territory", coords: [149.13, -35.28], label: { dx: 14, dy: 30, anchor: "start" } },
  { name: "Hobart", state: "TAS", stateName: "Tasmania", coords: [147.33, -42.88], label: { dx: 16, dy: 6, anchor: "start" } },
  { name: "Darwin", state: "NT", stateName: "Northern Territory", coords: [130.84, -12.46], label: { dx: 14, dy: 22, anchor: "start" } },
];

const points = cities.map((c) => ({ ...c, ...project(c.coords) }));
const hub = points[0];

/** Gently curved connection from the Sydney team to each city (quadratic Bézier bowed away from the coast). */
const routes = points.slice(1).map((c) => {
  const mx = (hub.x + c.x) / 2;
  const my = (hub.y + c.y) / 2;
  const dx = c.x - hub.x;
  const dy = c.y - hub.y;
  const len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(90, len * 0.22);
  // Perpendicular offset, always bending north (towards the interior rather than out to sea).
  const flip = dx < 0 ? -1 : 1;
  const nx = (dy / len) * bow * flip;
  const ny = (-dx / len) * bow * flip;
  return { key: c.name, d: `M${hub.x.toFixed(1)} ${hub.y.toFixed(1)}Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}` };
});

const STATES = cities.map((c) => c.state);

function AustraliaMap() {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-labelledby="coverage-map-title coverage-map-desc"
      className="coverage-map block h-auto w-full"
    >
      <title id="coverage-map-title">Map of Australia showing ITGeek remote support coverage</title>
      <desc id="coverage-map-desc">
        Remote support is available Australia-wide, including {cities.map((c) => `${c.name} ${c.state}`).join(", ")}.
      </desc>
      <defs>
        <linearGradient id="coverage-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2c5c" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0d1f45" stopOpacity="0.95" />
        </linearGradient>
        <pattern id="coverage-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="1.3" fill="#a9b8d6" fillOpacity="0.22" />
        </pattern>
        <clipPath id="coverage-clip">
          {LAND_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <radialGradient id="coverage-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g aria-hidden="true">
        {LAND_PATHS.map((d, i) => (
          <path key={i} d={d} fill="url(#coverage-land)" />
        ))}
        <rect width={VIEW_W} height={VIEW_H} fill="url(#coverage-dots)" clipPath="url(#coverage-clip)" />
        {LAND_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#5b8ff0"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {routes.map((r) => (
          <path
            key={r.key}
            d={r.d}
            fill="none"
            stroke="#22c55e"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            strokeDasharray="3 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="coverage-route"
          />
        ))}

        {points.map((c, i) => (
          <g key={c.name} transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`}>
            <circle r="22" fill="url(#coverage-glow)" opacity="0.5" />
            <circle
              r="9"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              className="coverage-pulse"
              style={{ animationDelay: `${(i * 0.45).toFixed(2)}s` }}
            />
            <circle r="6.5" fill="#22c55e" stroke="#071330" strokeWidth="2.5" />
            <circle r="2.2" fill="#fff" />
            <text
              x={c.label.dx}
              y={c.label.dy}
              textAnchor={c.label.anchor}
              className="coverage-label"
            >
              {c.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function RemoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
      <path d="M8 20.5h8M12 16.5v4" />
      <path d="m9 10 2 2 4-4" />
    </svg>
  );
}

export function Coverage() {
  return (
    <section id="coverage" aria-labelledby="coverage-title" className="section-y relative isolate overflow-hidden bg-subtle">
      <div className="container-page grid items-center gap-10 lg:gap-14 xl:grid-cols-[minmax(0,560px)_minmax(0,680px)] xl:justify-between xl:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeader
            id="coverage-title"
            align="left"
            index="05"
            eyebrow="Our service coverage"
            title="IT support that reaches all across Australia."
            subtitle="Wherever you are in Australia, expert IT help is just a call or click away. ITGeek provides secure remote Microsoft 365 support and antivirus assistance to homes and businesses nationwide."
          />

          <ul data-reveal-group className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <li className="glass-light flex items-start gap-4 rounded-2xl p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-soft text-green-ink ring-1 ring-green/15 ring-inset">
                <RemoteIcon />
              </span>
              <div className="flex flex-col gap-1">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-h5 text-heading">Remote support</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-soft px-2.5 py-0.5 text-xs leading-5 font-semibold text-green-ink">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
                    Australia-wide
                  </span>
                </p>
                <p className="text-sm leading-[22px] text-body">
                  Available in every state and territory — help with Microsoft 365 and antivirus through secure remote tools.
                </p>
              </div>
            </li>
            <li className="glass-light flex items-start gap-4 rounded-2xl p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/10 ring-inset">
                <PinIcon />
              </span>
              <div className="flex flex-col gap-1">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-h5 text-heading">Onsite support</span>
                  <span className="inline-flex rounded-full bg-subtle px-2.5 py-0.5 text-xs leading-5 font-semibold text-muted ring-1 ring-line ring-inset">
                    Service area only
                  </span>
                </p>
                <p className="text-sm leading-[22px] text-body">
                  Onsite visits are limited to ITGeek’s service coverage area and are subject to confirmation. Contact us to
                  check availability.
                </p>
              </div>
            </li>
          </ul>

          <div data-reveal className="flex flex-col items-start gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-start">
            <p className="text-h5 text-heading">
              One trusted support team.{" "}
              <span className="text-brand">Nationwide remote assistance.</span>
            </p>
            <Button enquiry="Microsoft 365 help" icon="arrow-right-white" className="w-full sm:w-auto">
              Get help from anywhere
            </Button>
          </div>
        </div>

        <div data-reveal className="on-dark surface-dark relative overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8">
          <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-eyebrow text-on-dark-muted">Nationwide remote coverage</p>
              <p className="text-h4 text-white">All 8 states &amp; territories</p>
            </div>
            <p className="inline-flex items-center gap-2 self-start rounded-full bg-green-bright/14 px-3 py-1.5 text-sm leading-5 font-semibold text-green-bright ring-1 ring-green-bright/30 ring-inset sm:self-auto">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="coverage-ping absolute inset-0 rounded-full bg-green-bright" />
                <span className="relative size-2 rounded-full bg-green-bright" />
              </span>
              Remote support available
            </p>
          </div>

          <ol aria-label="States and territories covered by remote support" className="relative mt-4 grid grid-cols-8 gap-1">
            {STATES.map((s) => (
              <li key={s} className="flex flex-col items-center gap-1.5">
                <span aria-hidden="true" className="h-1 w-full rounded-full bg-green-bright/80" />
                <span className="text-[10px] leading-3 font-semibold tracking-wide text-on-dark-muted sm:text-[11px]">{s}</span>
              </li>
            ))}
          </ol>

          <div className="relative mx-auto mt-2 max-w-[560px] xl:max-w-none">
            <AustraliaMap />
          </div>

          <ul
            aria-label="Major cities with remote support"
            className="relative grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4"
          >
            {cities.map((c) => (
              <li key={c.name} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/8 ring-inset">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-green-bright" />
                <span className="text-sm leading-5 font-semibold text-white">{c.name},</span>
                <abbr title={c.stateName} className="text-sm leading-5 text-on-dark-muted no-underline">
                  {c.state}
                </abbr>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
