import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

// Brand Logo Mark: Pinned paper note with key and tape from official brand assets
export function BrandLogoMark({ size = 34, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Campus Lost and Found mark"
      {...props}
    >
      {/* Shadow */}
      <rect x="18" y="22" width="88" height="88" rx="12" fill="#231F20" />
      {/* Yellow sticky note */}
      <rect x="10" y="14" width="88" height="88" rx="12" fill="#F2B84B" stroke="#231F20" strokeWidth="5.5" />
      {/* Sky blue tape strip */}
      <rect x="34" y="4" width="40" height="18" fill="#A9D4E8" stroke="#231F20" strokeWidth="4.5" />
      {/* Coral key bow */}
      <circle cx="38" cy="60" r="17" fill="#D9482B" stroke="#231F20" strokeWidth="5.5" />
      <circle cx="38" cy="60" r="6" fill="#231F20" />
      {/* Key blade */}
      <rect x="52" y="54" width="38" height="12" fill="#231F20" />
      <rect x="76" y="64" width="9" height="14" fill="#231F20" />
      <rect x="62" y="64" width="9" height="10" fill="#231F20" />
    </svg>
  );
}

// Category Icons (Flat 3.5px ink strokes, solid fills, no emojis)
export function KeyIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round" transform="rotate(35 50 50)">
        <circle cx="24" cy="50" r="17" fill="#F2B84B" />
        <circle cx="24" cy="50" r="5.5" fill="#F7F0E3" />
        <rect x="40" y="46" width="50" height="9" rx="2" fill="#F2B84B" />
        <rect x="72" y="55" width="8" height="11" fill="#F2B84B" />
        <rect x="58" y="55" width="8" height="8" fill="#F2B84B" />
      </g>
    </svg>
  );
}

export function WalletIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="10" y="26" width="80" height="56" rx="9" fill="#D9482B" />
        <path d="M10 40h80" fill="none" />
        <rect x="58" y="52" width="32" height="18" rx="6" fill="#F7F0E3" />
        <circle cx="70" cy="61" r="3" fill="#231F20" />
      </g>
    </svg>
  );
}

export function PhoneIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="28" y="8" width="44" height="84" rx="9" fill="#A9D4E8" />
        <rect x="34" y="18" width="32" height="56" rx="3" fill="#FFFFFF" />
        <circle cx="50" cy="83" r="3.5" fill="#231F20" />
      </g>
    </svg>
  );
}

export function BagIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M38 20c0-9 24-9 24 0" fill="none" />
        <rect x="20" y="20" width="60" height="72" rx="20" fill="#9CC5A1" />
        <rect x="32" y="56" width="36" height="26" rx="8" fill="#F7F0E3" />
        <path d="M32 40h36" fill="none" />
      </g>
    </svg>
  );
}

export function UmbrellaIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M8 52C8 24 30 10 50 10s42 14 42 42z" fill="#D9482B" />
        <path d="M50 52v32c0 8-12 8-12 0" fill="none" />
        <path d="M29 52c0-14 8-30 21-42M71 52c0-14-8-30-21-42" fill="none" />
      </g>
    </svg>
  );
}

export function IdCardIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8" y="22" width="84" height="56" rx="8" fill="#FFFFFF" />
        <circle cx="33" cy="48" r="9" fill="#F2B84B" />
        <path d="M20 70c2-9 20-9 26 0" fill="none" />
        <path d="M56 40h26M56 52h26M56 64h16" fill="none" />
      </g>
    </svg>
  );
}

export function BottleIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="40" y="6" width="20" height="12" rx="3" fill="#231F20" />
        <rect x="30" y="18" width="40" height="76" rx="14" fill="#A9D4E8" />
        <path d="M30 52h40" fill="none" />
      </g>
    </svg>
  );
}

export function BooksIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="14" y="60" width="72" height="18" rx="4" fill="#F2B84B" />
        <rect x="18" y="40" width="68" height="18" rx="4" fill="#9CC5A1" />
        <rect x="22" y="20" width="60" height="18" rx="4" fill="#D9482B" />
        <path d="M14 66h72M18 46h68M22 26h60" fill="none" />
      </g>
    </svg>
  );
}

export function LaptopIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="18" y="20" width="64" height="46" rx="6" fill="#A9D4E8" />
        <rect x="24" y="26" width="52" height="34" rx="2" fill="#FFFFFF" />
        <path d="M8 74h84c2 0 4-2 4-4H4c0 2 2 4 4 4z" fill="#231F20" />
        <path d="M42 70h16" stroke="#F7F0E3" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export function ClothingIllustration({ size = 64, className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" {...props}>
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M34 16 L20 28 L30 40 L34 34 L34 84 L66 84 L66 34 L70 40 L80 28 L66 16 Z" fill="#F9D3C7" />
        <path d="M42 16 Q50 26 58 16" fill="none" />
      </g>
    </svg>
  );
}

// Map Category Enum to Drawing
export function CategoryDrawing({
  category,
  size = 64,
  className = "",
}: {
  category: string;
  size?: number | string;
  className?: string;
}) {
  switch (category) {
    case "KEYS":
      return <KeyIllustration size={size} className={className} />;
    case "WALLET":
      return <WalletIllustration size={size} className={className} />;
    case "ELECTRONICS":
      return <LaptopIllustration size={size} className={className} />;
    case "BAGS":
      return <BagIllustration size={size} className={className} />;
    case "ID_CARDS":
      return <IdCardIllustration size={size} className={className} />;
    case "BOOKS":
      return <BooksIllustration size={size} className={className} />;
    case "CLOTHING":
      return <ClothingIllustration size={size} className={className} />;
    case "OTHER":
    default:
      return <BottleIllustration size={size} className={className} />;
  }
}

// Scene: Campus Hero Scene (Comprehensive Panorama matching official reference)
export function CampusHeroScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 840 320"
      className={className}
      role="img"
      aria-label="Illustration of the campus lost and found journey with a trail of lost items leading to the campus building"
    >
      <defs>
        {/* Subtle paper stipple pattern */}
        <pattern id="paper-fleck-pat" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="18" r="0.8" fill="#231F20" opacity="0.15" />
          <circle cx="42" cy="35" r="0.6" fill="#231F20" opacity="0.12" />
          <circle cx="28" cy="52" r="0.7" fill="#231F20" opacity="0.18" />
        </pattern>
      </defs>

      <rect width="840" height="320" fill="url(#paper-fleck-pat)" opacity="0.8" />

      {/* --- BACKGROUND ACCENTS (Stars, Wind Swirls, Crosses) --- */}
      {/* 4-point sparkle stars */}
      <path d="M 60 70 Q 60 74 64 74 Q 60 74 60 78 Q 60 74 56 74 Q 60 74 60 70 Z" fill="#231F20" />
      <path d="M 155 78 Q 155 82 159 82 Q 155 82 155 86 Q 155 82 151 82 Q 155 82 155 78 Z" fill="#231F20" />
      <path d="M 330 45 Q 330 50 335 50 Q 330 50 330 55 Q 330 50 325 50 Q 330 50 330 45 Z" fill="#231F20" />
      <path d="M 505 85 Q 505 90 510 90 Q 505 90 505 95 Q 505 90 500 90 Q 505 90 505 85 Z" fill="#231F20" />
      <path d="M 815 135 Q 815 139 819 139 Q 815 139 815 143 Q 815 139 811 139 Q 815 139 815 135 Z" fill="#231F20" />
      <path d="M 35 270 Q 35 274 39 274 Q 35 274 35 278 Q 35 274 31 274 Q 35 274 35 270 Z" fill="#231F20" />

      {/* Wind swirl curls */}
      <path d="M 205 285 C 208 288 214 288 215 284 C 216 280 210 278 206 281" fill="none" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 500 120 C 504 124 511 123 511 118 C 511 113 505 112 501 116" fill="none" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 818 100 C 822 104 828 103 828 98 C 828 93 823 92 819 96" fill="none" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />

      {/* Cross marks (+) */}
      <path d="M 440 68 V 76 M 436 72 H 444" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 760 148 V 156 M 756 152 H 764" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 470 270 V 278 M 466 274 H 474" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />

      {/* --- SKY: SUN AND CLOUDS --- */}
      {/* Sun */}
      <circle cx="750" cy="72" r="28" fill="#F2B84B" stroke="#231F20" strokeWidth="2.8" />

      {/* Clouds */}
      <g stroke="#231F20" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF">
        {/* Cloud 1 */}
        <path d="M 675 66 a 9 9 0 0 1 15 -4 a 14 14 0 0 1 22 2 a 11 11 0 0 1 12 11 a 7 7 0 0 1 -7 7 h -38 a 8 8 0 0 1 -4 -16 z" />
        {/* Cloud 2 */}
        <path d="M 720 96 a 8 8 0 0 1 13 -3 a 12 12 0 0 1 19 2 a 9 9 0 0 1 10 9 a 6 6 0 0 1 -6 6 h -32 a 7 7 0 0 1 -4 -14 z" />
      </g>

      {/* --- STARTING ANCHOR: SKETCHED ARROW & SPARKLES --- */}
      {/* Sparkles next to arrow */}
      <path d="M 14 172 Q 14 177 19 177 Q 14 177 14 182 Q 14 177 9 177 Q 14 177 14 172 Z" fill="#231F20" />
      <path d="M 28 160 Q 28 164 32 164 Q 28 164 28 168 Q 28 164 24 164 Q 28 164 28 160 Z" fill="#231F20" />

      {/* Sketched Yellow Arrow pointing up-right into trail */}
      <g transform="translate(18, 202) rotate(-35)">
        <path d="M 0 10 L 28 10 L 28 4 L 44 15 L 28 26 L 28 20 L 0 20 Z" fill="#F2B84B" stroke="#231F20" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Hand-drawn texture hatches */}
        <line x1="8" y1="11" x2="14" y2="19" stroke="#231F20" strokeWidth="1.5" />
        <line x1="16" y1="11" x2="22" y2="19" stroke="#231F20" strokeWidth="1.5" />
        <line x1="24" y1="11" x2="30" y2="19" stroke="#231F20" strokeWidth="1.5" />
      </g>

      {/* --- THE LOOPING DASHED TRAIL --- */}
      <path
        d="M 52 175
           C 80 150, 115 125, 145 135
           C 175 145, 160 215, 125 210
           C 95 205, 110 150, 155 120
           C 195 95, 235 105, 265 140
           C 295 175, 280 240, 240 245
           C 205 250, 215 205, 255 170
           C 295 135, 340 115, 380 145
           C 420 175, 410 235, 370 235
           C 335 235, 345 185, 390 150
           C 430 120, 480 130, 520 160
           C 545 180, 560 195, 575 200"
        fill="none"
        stroke="#231F20"
        strokeWidth="2.2"
        strokeDasharray="5 7"
        strokeLinecap="round"
      />

      {/* --- TRAIL ITEMS --- */}
      {/* 1. Golden Key along trail */}
      <g transform="translate(68, 150) rotate(35)">
        <circle cx="8" cy="8" r="7" fill="#F2B84B" stroke="#231F20" strokeWidth="2.2" />
        <circle cx="8" cy="8" r="2.5" fill="#F7F0E3" stroke="#231F20" strokeWidth="1.8" />
        <rect x="15" y="6.5" width="20" height="4" rx="1" fill="#F2B84B" stroke="#231F20" strokeWidth="2" />
        <rect x="26" y="10.5" width="3.5" height="4.5" fill="#F2B84B" stroke="#231F20" strokeWidth="1.8" />
        <rect x="31" y="10.5" width="3.5" height="4.5" fill="#F2B84B" stroke="#231F20" strokeWidth="1.8" />
      </g>

      {/* 2. Green Umbrella along trail */}
      <g transform="translate(145, 105) rotate(-15)">
        <path d="M 24 6 V 12" stroke="#231F20" strokeWidth="2.5" />
        <path d="M 6 32 C 6 16 14 12 24 12 C 34 12 42 16 42 32 C 36 29 32 32 24 29 C 16 32 12 29 6 32 Z" fill="#9CC5A1" stroke="#231F20" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 24 12 C 18 20 15 29 15 30 M 24 12 C 30 20 33 29 33 30" fill="none" stroke="#231F20" strokeWidth="1.8" />
        <path d="M 24 30 V 46 C 24 51 18 51 18 47" fill="none" stroke="#231F20" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3. Green Sneaker along trail */}
      <g transform="translate(170, 190) rotate(-30)">
        <path d="M 4 20 C 4 12 12 10 22 13 L 34 17 C 38 18 42 22 40 26 H 4 Z" fill="#9CC5A1" stroke="#231F20" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 32 17 C 36 18 41 21 40 26 H 32 Z" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" strokeLinejoin="round" />
        <rect x="2" y="26" width="40" height="5" rx="2" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />
        <path d="M 16 15 L 24 21 M 20 14 L 28 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 4. Yellow Spiral Notebook & Pen along trail */}
      <g transform="translate(230, 130) rotate(10)">
        <rect x="6" y="4" width="30" height="40" rx="4" fill="#F2B84B" stroke="#231F20" strokeWidth="2.2" />
        <rect x="10" y="8" width="22" height="32" rx="2" fill="#FFF8DC" stroke="#231F20" strokeWidth="1.5" />
        <path d="M 4 8 C 2 8 2 11 6 11 M 4 15 C 2 15 2 18 6 18 M 4 22 C 2 22 2 25 6 25 M 4 29 C 2 29 2 32 6 32 M 4 36 C 2 36 2 39 6 39" fill="none" stroke="#231F20" strokeWidth="2" strokeLinecap="round" />
        {/* Pen */}
        <rect x="38" y="10" width="5" height="30" rx="2" fill="#FFFFFF" stroke="#231F20" strokeWidth="1.8" />
        <path d="M 38 36 L 40.5 42 L 43 36 Z" fill="#231F20" stroke="#231F20" strokeWidth="1.5" />
        <path d="M 40 14 V 22" stroke="#231F20" strokeWidth="1.5" />
      </g>

      {/* 5. Paper Airplane along trail */}
      <g transform="translate(330, 48) rotate(25)">
        <path d="M 0 16 L 36 2 L 14 26 L 10 36 L 14 26 L 0 16 Z" fill="#FFFFFF" stroke="#231F20" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 36 2 L 14 26" stroke="#231F20" strokeWidth="1.8" />
        <path d="M -12 24 C -6 23 -2 20 2 22 M -16 29 C -10 28 -5 26 -1 27" stroke="#231F20" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      </g>

      {/* 6. Water Bottle along trail */}
      <g transform="translate(380, 110) rotate(15)">
        <rect x="8" y="0" width="10" height="6" rx="2" fill="#231F20" />
        <rect x="9.5" y="6" width="7" height="3" fill="#A9D4E8" stroke="#231F20" strokeWidth="1.8" />
        <rect x="4" y="9" width="18" height="38" rx="6" fill="#A9D4E8" stroke="#231F20" strokeWidth="2.2" />
        <rect x="4" y="21" width="18" height="12" fill="#FFFFFF" stroke="#231F20" strokeWidth="1.8" />
        <path d="M 13 25 C 13 25 10 29 10 30.5 C 10 32 11.5 33 13 33 C 14.5 33 16 32 16 30.5 C 16 29 13 25 13 25 Z" fill="#A9D4E8" />
      </g>

      {/* --- RIGHT SIDE: CAMPUS BUILDING & GROUND SCENE --- */}
      {/* Ground Line */}
      <path d="M 400 250 H 830" stroke="#231F20" strokeWidth="2.8" />

      {/* Grass tufts */}
      <g stroke="#231F20" strokeWidth="1.8" strokeLinecap="round">
        <path d="M 527 250 L 524 241 M 530 250 V 239 M 533 250 L 536 242" />
        <path d="M 612 250 L 609 242 M 615 250 V 240 M 618 250 L 621 243" />
        <path d="M 785 250 L 782 242 M 788 250 V 240 M 791 250 L 794 243" />
      </g>

      {/* Tree on right */}
      <g stroke="#231F20" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M 770 215 V 250" strokeWidth="3" />
        <circle cx="770" cy="195" r="26" fill="#9CC5A1" strokeWidth="2.8" />
      </g>

      {/* Backpack to left of house */}
      <g transform="translate(540, 195)">
        <path d="M 12 4 C 12 -2 22 -2 22 4" fill="none" stroke="#231F20" strokeWidth="2.5" />
        <rect x="5" y="4" width="24" height="42" rx="9" fill="#9CC5A1" stroke="#231F20" strokeWidth="2.5" />
        <rect x="9" y="22" width="16" height="18" rx="4" fill="#F7F0E3" stroke="#231F20" strokeWidth="2" />
        <path d="M 9 14 H 25" stroke="#231F20" strokeWidth="2" />
      </g>

      {/* Campus Building */}
      <g stroke="#231F20" strokeWidth="2.8" strokeLinejoin="round">
        {/* Roof */}
        <path d="M 555 125 L 650 72 L 745 125 Z" fill="#D9482B" />
        {/* Main Walls */}
        <rect x="568" y="125" width="164" height="125" fill="#9CC5A1" />
        {/* Doorway */}
        <rect x="630" y="172" width="40" height="78" rx="2" fill="#231F20" />
        {/* Windows */}
        <rect x="582" y="138" width="28" height="32" rx="3" fill="#F7F0E3" strokeWidth="2.2" />
        <rect x="636" y="138" width="28" height="32" rx="3" fill="#F7F0E3" strokeWidth="2.2" />
        <rect x="690" y="138" width="28" height="32" rx="3" fill="#F7F0E3" strokeWidth="2.2" />
        <rect x="582" y="185" width="28" height="32" rx="3" fill="#F7F0E3" strokeWidth="2.2" />
        <rect x="690" y="185" width="28" height="32" rx="3" fill="#F7F0E3" strokeWidth="2.2" />
      </g>

      {/* Pinned Sticky Note on the Door */}
      <g transform="rotate(-4 645 220)">
        <rect x="600" y="195" width="122" height="62" rx="4" fill="#FFF8DC" stroke="#231F20" strokeWidth="2.5" />
        <rect x="643" y="190" width="26" height="12" rx="1" fill="#A9D4E8" stroke="#231F20" strokeWidth="2" transform="rotate(-2 656 196)" />
        <text x="612" y="222" fontFamily="var(--font-caveat), Caveat, cursive" fontSize="17" fontWeight="bold" fill="#231F20">
          Found: blue bag
        </text>
        <text x="612" y="242" fontFamily="var(--font-caveat), Caveat, cursive" fontSize="14" fontWeight="600" fill="#D9482B">
          Library, 2nd floor
        </text>
      </g>

      {/* Red/Coral Mitten on ground */}
      <g transform="translate(565, 260) rotate(-15)">
        <rect x="2" y="1" width="16" height="6" rx="2" fill="#F7F0E3" stroke="#231F20" strokeWidth="2" />
        <path d="M 3 7 C 3 18 17 18 17 7 Z" fill="#D9482B" stroke="#231F20" strokeWidth="2" />
        <path d="M 3 10 C 0 11 0 15 3 15 Z" fill="#D9482B" stroke="#231F20" strokeWidth="1.8" />
      </g>

      {/* Striped Sock on ground */}
      <g transform="translate(660, 275) rotate(25)">
        <path d="M 4 2 V 14 C 4 20 18 20 22 17 C 23 14 20 12 16 12 H 10 V 2 Z" fill="#F7F0E3" stroke="#231F20" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 4 5 H 10 M 4 8 H 10" stroke="#D9482B" strokeWidth="2" />
        <path d="M 18 17 C 21 16 21 14 18 13" stroke="#D9482B" strokeWidth="2" />
      </g>

      {/* ID Card on ground with motion lines */}
      <g transform="translate(735, 270) rotate(-10)">
        <rect x="0" y="0" width="28" height="18" rx="3" fill="#A9D4E8" stroke="#231F20" strokeWidth="2" />
        <rect x="4" y="4" width="7" height="5" rx="1" fill="#F2B84B" stroke="#231F20" strokeWidth="1" />
        <line x1="4" y1="12" x2="16" y2="12" stroke="#231F20" strokeWidth="1.5" />
        <line x1="4" y1="14.5" x2="22" y2="14.5" stroke="#231F20" strokeWidth="1.5" />
        <path d="M -5 3 L -2 5 M -6 9 L -3 11" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Key on ground */}
      <g transform="translate(740, 245) rotate(40)">
        <circle cx="8" cy="8" r="6" fill="#F2B84B" stroke="#231F20" strokeWidth="2" />
        <circle cx="8" cy="8" r="2" fill="#F7F0E3" stroke="#231F20" strokeWidth="1.5" />
        <rect x="14" y="6.5" width="16" height="3.5" rx="1" fill="#F2B84B" stroke="#231F20" strokeWidth="1.8" />
        <rect x="23" y="10" width="3" height="4" fill="#F2B84B" stroke="#231F20" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// Scene: Speech Bubble with Question Mark (for Step 2 / Verification Detail)
export function QuestionBubbleIllustration({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={(size * 100) / 120} viewBox="0 0 120 100" className={className} aria-hidden="true">
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M14 14h92a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H50L28 90V70H14a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z" fill="#F9D3C7" />
      </g>
      <text x="60" y="58" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif" fontWeight="700" fontSize="40" fill="#231F20">
        ?
      </text>
    </svg>
  );
}

// Scene: 6-Digit Handover Code Ticket (for Step 3 & Handover)
export function HandoverTicketIllustration({
  code = "482917",
  size = 120,
  className = "",
}: {
  code?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={(size * 100) / 120} viewBox="0 0 120 100" className={className} aria-hidden="true">
      <g stroke="#231F20" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="6" y="20" width="108" height="60" rx="10" fill="#F2B84B" />
        <circle cx="6" cy="50" r="9" fill="#FFFFFF" />
        <circle cx="114" cy="50" r="9" fill="#FFFFFF" />
      </g>
      <text
        x="60"
        y="61"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontWeight="700"
        fontSize="24"
        letterSpacing="3"
        fill="#231F20"
      >
        {code}
      </text>
    </svg>
  );
}

// Scene: Lost Note / Empty Board Scene (for Empty states, 404, 500)
export function LostNoteScene({
  title = "Nothing pinned here yet",
  subtitle = "Check back soon or post an item",
  className = "",
  size,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  size?: number | string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative w-48 h-40 mb-4">
        {/* Taped note */}
        <div className="absolute inset-x-4 inset-y-2 bg-note-yellow border-2.5 border-ink rounded-note shadow-hard-note rotate-[-2deg] p-4 flex flex-col items-center justify-center">
          <div className="tape-strip" />
          <span className="font-hand text-2xl text-ink leading-tight">{title}</span>
          <span className="text-[12px] text-ink-soft mt-1">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
