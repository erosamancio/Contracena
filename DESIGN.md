# Contracena: sistema visual

Cada tela é um folheto de cordel. O papel colorido ocupa a tela inteira e a tinta é preta.

## Cores
- Tinta: `#15100E` (texto, gravuras, botões principais, verso do folheto no papel secreto)
- Papéis por categoria: capa `#F4C531`, Casados há 20 anos `#7FC9B4`, Primeiro encontro `#F4A3BE`, Novela das nove `#E0553A`, Expediente `#7FA6E8`, Absurdo `#B4D84A`, Picante `#F08A3A`
- O `body[data-cor]` troca `--papel`; o `theme-color` acompanha.

## Tipos
- Títulos: Alfa Slab One, caixa alta, ajustada por JS para caber na largura (`caber()`).
- Texto: Alegreya (variável 400 a 800, itálico para as falas de cordel).

## Elementos
- Serrilhado (`.serra`) no topo da capa e entre capa e texto da cena.
- Gravuras em SVG (`gravuras.js`), preto com cortes na cor do papel e filtro `#tinta` que borra a borda como impressão.
- Chapa: botão preto com contorno duplo; links sublinhados para ações secundárias.
- Sem cantos arredondados, sem gradientes, sem sombras dentro do folheto.

## Movimento
- Um momento só: ao sortear, a capa da cena "sai da prensa" (clip-path de cima para baixo) e a gravura entinta (blur para nítido).
- Reviravolta entra como carimbo. Tudo respeita `prefers-reduced-motion`.
