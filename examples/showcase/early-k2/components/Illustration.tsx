// Decorative, original SVG artwork. No educational objects or claims.
export function Illustration({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? "illustration compact" : "illustration"} viewBox="0 0 640 330" fill="none" aria-hidden="true" focusable="false">
      <path d="M83 223C30 152 107 53 224 61C296 10 370 33 402 63C560 25 620 169 551 246C463 322 170 312 83 223Z" fill="#EEE3FD" />
      <ellipse cx="325" cy="285" rx="191" ry="14" fill="#E3D1F9" />
      <g className="illustration-float">
        <rect x="204" y="91" width="213" height="179" rx="65" fill="#8B5CF6" />
        <path d="M232 105C269 87 319 87 352 102" stroke="#C4A6FC" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="276" cy="174" rx="8" ry="11" fill="#2D2538" /><ellipse cx="347" cy="174" rx="8" ry="11" fill="#2D2538" />
        <path d="M295 208Q311 224 329 208" stroke="#2D2538" strokeWidth="7" strokeLinecap="round" />
        <circle cx="256" cy="199" r="12" fill="#C4A6FC" /><circle cx="369" cy="199" r="12" fill="#C4A6FC" />
      </g>
      <path d="M125 123L133 99L141 123L165 131L141 139L133 163L125 139L101 131Z" fill="#7C3AED" />
      <path d="M472 85L478 67L484 85L502 91L484 97L478 115L472 97L454 91Z" fill="#7C3AED" />
      <circle cx="475" cy="229" r="33" fill="#D5BDFB" /><path d="M483 208Q491 212 494 220" stroke="#FFF8F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx="157" cy="241" r="16" fill="#B695EF" />
      <path d="M539 157L547 169M551 148L561 151" stroke="#8B5CF6" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
