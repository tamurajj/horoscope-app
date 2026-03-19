/**
 * 天体シンボル SVGパス辞書
 * viewBox: 0 0 24 24 を想定
 */
export const SYMBOLS = {
  sun: `<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,

  moon: `<path d="M17 12A7 7 0 0 1 10 5a7 7 0 1 0 7 7z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,

  mercury: `<circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <line x1="12" y1="13" x2="12" y2="19" stroke="currentColor" stroke-width="1.5"/>
            <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 6.5A4 4 0 0 1 16 6.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`,

  venus: `<circle cx="12" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="13.5" x2="12" y2="20" stroke="currentColor" stroke-width="1.5"/>
          <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" stroke-width="1.5"/>`,

  mars: `<circle cx="10" cy="13" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
         <line x1="13.5" y1="9.5" x2="19" y2="4" stroke="currentColor" stroke-width="1.5"/>
         <polyline points="14,4 19,4 19,9" fill="none" stroke="currentColor" stroke-width="1.5"/>`,

  jupiter: `<path d="M13 5 C8 5 6 8 6 11 C6 14 8 15 11 15 L18 15" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <line x1="13" y1="5" x2="13" y2="20" stroke="currentColor" stroke-width="1.5"/>
            <line x1="8" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="1.5"/>`,

  saturn: `<path d="M11 5 L11 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
           <path d="M7 8 C7 8 9 6 11 8 C13 10 15 8 17 9" fill="none" stroke="currentColor" stroke-width="1.5"/>
           <line x1="8" y1="14" x2="14" y2="14" stroke="currentColor" stroke-width="1.5"/>`,

  uranus: `<circle cx="12" cy="15" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
           <line x1="12" y1="4" x2="12" y2="11.5" stroke="currentColor" stroke-width="1.5"/>
           <line x1="7" y1="7" x2="12" y2="4" stroke="currentColor" stroke-width="1.5"/>
           <line x1="17" y1="7" x2="12" y2="4" stroke="currentColor" stroke-width="1.5"/>
           <circle cx="12" cy="4" r="1" fill="currentColor"/>`,

  neptune: `<path d="M12 4 L12 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 10 C6 6 18 6 18 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <line x1="7" y1="20" x2="17" y2="20" stroke="currentColor" stroke-width="1.5"/>
            <line x1="7" y1="14" x2="17" y2="14" stroke="currentColor" stroke-width="1.5"/>`,

  pluto: `<circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="11.5" x2="12" y2="19" stroke="currentColor" stroke-width="1.5"/>
          <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5 A4 4 0 0 1 16 5" fill="none" stroke="currentColor" stroke-width="1.5"/>`,

  northNode: `<circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 8 L12 5 L16 8" fill="none" stroke="currentColor" stroke-width="1.5"/>`,

  southNode: `<circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 16 L12 19 L16 16" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
}