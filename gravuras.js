// Gravuras em estilo xilogravura, uma por categoria.
// Preto = currentColor (tinta). Cortes = var(--papel).
const CORTE = 'fill="none" stroke="var(--papel)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';

const MOLDURA = `
  <rect x="3" y="3" width="194" height="134" fill="none" stroke="currentColor" stroke-width="4"/>
  <rect x="10" y="10" width="180" height="120" fill="none" stroke="currentColor" stroke-width="1.5"/>`;

const GRAVURAS = {
  // panela no fogão com fumaça
  rotina: `
    <g fill="currentColor">
      <path d="M52 66 H148 V102 C148 114 138 120 126 120 H74 C62 120 52 114 52 102Z"/>
      <rect x="44" y="60" width="112" height="9"/>
      <path d="M84 60 C84 50 116 50 116 60Z"/>
      <rect x="95" y="46" width="10" height="6"/>
      <rect x="32" y="74" width="22" height="8"/>
      <rect x="146" y="74" width="22" height="8"/>
      <path d="M40 124 H160 V130 H40Z"/>
      <path d="M70 34 C62 26 76 20 68 12 C74 14 82 22 74 30 C80 32 76 36 70 34Z"/>
      <path d="M100 32 C92 24 106 18 98 10 C104 12 112 20 104 28 C110 30 106 34 100 32Z"/>
      <path d="M130 34 C122 26 136 20 128 12 C134 14 142 22 134 30 C140 32 136 36 130 34Z"/>
    </g>
    <g ${CORTE}>
      <path d="M62 78 H138"/><path d="M62 88 C80 92 120 92 138 88"/>
      <path d="M66 104 L74 96 L82 104 L90 96 L98 104 L106 96 L114 104 L122 96 L130 104"/>
      <path d="M60 127 L66 124 M80 127 L86 124 M100 127 L106 124 M120 127 L126 124 M140 127 L146 124"/>
    </g>`,

  // duas taças brindando
  encontro: `
    <g fill="currentColor">
      <g transform="rotate(-14 76 80)">
        <path d="M56 30 H96 C98 54 90 68 76 70 C62 68 54 54 56 30Z"/>
        <rect x="73" y="70" width="6" height="34"/>
        <path d="M58 108 C64 102 88 102 94 108Z"/>
      </g>
      <g transform="rotate(14 124 80)">
        <path d="M104 30 H144 C146 54 138 68 124 70 C110 68 102 54 104 30Z"/>
        <rect x="121" y="70" width="6" height="34"/>
        <path d="M106 108 C112 102 136 102 142 108Z"/>
      </g>
      <path d="M100 8 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1Z"/>
      <path d="M40 120 H160 V126 H40Z"/>
    </g>
    <g ${CORTE}>
      <g transform="rotate(-14 76 80)"><path d="M60 42 H92"/><path d="M64 50 C70 60 82 60 88 50"/></g>
      <g transform="rotate(14 124 80)"><path d="M108 42 H140"/><path d="M112 50 C118 60 130 60 136 50"/></g>
      <path d="M88 20 L82 14 M112 20 L118 14 M100 34 V40"/>
    </g>`,

  // coração partido em zigue-zague
  novela: `
    <g fill="currentColor">
      <path d="M96 124 C60 98 36 80 36 54 C36 34 52 22 68 22 C80 22 90 28 96 38 L88 54 L100 66 L90 82 L102 96 L96 124Z"/>
      <path d="M106 124 C142 98 166 80 166 54 C166 34 150 22 134 22 C122 22 112 28 106 38 L98 54 L110 66 L100 82 L112 96 L106 124Z" transform="translate(4 4)"/>
      <path d="M150 112 C146 120 152 126 156 122 C160 118 154 114 150 112Z"/>
      <path d="M160 98 C157 104 161 108 164 105 C167 102 163 100 160 98Z"/>
    </g>
    <g ${CORTE}>
      <path d="M50 52 C52 40 62 34 72 36"/><path d="M48 66 C54 80 66 92 80 102"/>
      <path d="M150 58 C150 46 142 38 132 38"/><path d="M152 74 C146 86 136 96 124 106"/>
    </g>`,

  // maleta de trabalho
  trabalho: `
    <g fill="currentColor">
      <path d="M80 38 C80 30 86 26 92 26 H108 C114 26 120 30 120 38 V46 H112 V38 C112 35 110 34 108 34 H92 C90 34 88 35 88 38 V46 H80Z"/>
      <rect x="40" y="46" width="120" height="74"/>
      <path d="M30 122 H170 V128 H30Z"/>
    </g>
    <g ${CORTE}>
      <path d="M40 74 H160"/>
      <rect x="92" y="68" width="16" height="14"/>
      <path d="M52 90 V110 M148 90 V110"/>
      <path d="M60 56 L66 62 M74 56 L80 62 M120 56 L126 62 M134 56 L140 62"/>
    </g>`,

  // disco voador com feixe
  absurdo: `
    <g fill="currentColor">
      <path d="M76 44 C76 26 124 26 124 44Z"/>
      <ellipse cx="100" cy="52" rx="62" ry="14"/>
      <path d="M86 64 L66 122 H134 L114 64Z" opacity=".9"/>
      <path d="M92 104 C92 96 108 96 108 104 V114 H92Z"/>
      <path d="M30 20 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/>
      <path d="M166 26 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/>
      <path d="M40 124 H160 V130 H40Z"/>
    </g>
    <g ${CORTE}>
      <path d="M86 36 C90 32 98 30 104 32"/>
      <circle cx="68" cy="52" r="3"/><circle cx="84" cy="54" r="3"/><circle cx="100" cy="55" r="3"/><circle cx="116" cy="54" r="3"/><circle cx="132" cy="52" r="3"/>
      <path d="M80 80 L76 92 M120 80 L124 92 M78 100 L74 112 M122 100 L126 112"/>
      <circle cx="96" cy="102" r="1.6"/><circle cx="104" cy="102" r="1.6"/>
    </g>`,

  // pimenta
  picante: `
    <g fill="currentColor">
      <path d="M120 40 C140 46 150 64 144 84 C136 108 104 124 58 126 C88 112 104 94 108 72 C110 58 112 46 120 40Z"/>
      <path d="M118 42 C116 30 122 22 132 18 L136 24 C128 26 124 32 126 40Z"/>
      <path d="M112 44 C118 34 132 34 138 44 C130 40 120 40 112 44Z"/>
      <path d="M40 30 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1Z"/>
      <path d="M160 100 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/>
    </g>
    <g ${CORTE}>
      <path d="M128 54 C134 64 132 80 124 92"/>
      <path d="M114 96 C104 106 92 112 80 116"/>
      <path d="M150 50 L160 44 M154 64 L166 62 M30 80 L42 84 M36 96 L46 94"/>
    </g>`,

  // boca
  quente: `
    <g fill="currentColor">
      <path d="M34 72 C52 52 74 40 90 50 C94 52 97 54 100 54 C103 54 106 52 110 50 C126 40 148 52 166 72 C150 74 130 76 100 76 C70 76 50 74 34 72Z"/>
      <path d="M34 76 C62 80 138 80 166 76 C150 104 126 118 100 118 C74 118 50 104 34 76Z"/>
      <path d="M40 30 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1Z"/>
      <path d="M160 26 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1Z"/>
    </g>
    <g ${CORTE}>
      <path d="M60 64 C72 58 82 58 92 62"/><path d="M140 64 C128 58 118 58 108 62"/>
      <path d="M62 92 C80 104 120 104 138 92"/><path d="M80 104 C92 110 108 110 120 104"/>
      <path d="M100 86 V96"/>
    </g>`,
};

function gravuraSVG(cat) {
  return `<svg viewBox="0 0 200 140" class="xilo"><g filter="url(#tinta)">${MOLDURA}${GRAVURAS[cat] || ''}</g></svg>`;
}

// Versão pequena, sem moldura, para os quadradinhos das categorias.
function iconeSVG(cat) {
  return `<svg viewBox="22 6 156 128" class="xilo" aria-hidden="true"><g filter="url(#tinta)">${GRAVURAS[cat] || ''}</g></svg>`;
}
