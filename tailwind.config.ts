import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        primary: "#b7a99a",
        secondary: "#504538",
        accent: "#00b4ff",
        offwhite: "#ede4d9",
        sand: "#dca75b",
        link: "#e73427",
        castle: {
          stoneDark:      "#2e2e3a",
          stoneMid:       "#4a4a5c",
          stoneLight:     "#6b6b80",
          stoneHighlight: "#8e8ea8",
          mortar:         "#242430",
          skyDeep:        "#0a1628",
          skyMid:         "#1a2e4a",
          skyLight:       "#2d4a6e",
          torchOrange:    "#ff922f",
          torchAmber:     "#ffb347",
          torchYellow:    "#ffe066",
          woodDark:       "#1a0f08",
          woodMid:        "#2d1f0f",
          wood:           "#4a3520",
          woodHighlight:  "#6b4f2f",
          ironDark:       "#1e1e28",
          ironMid:        "#2e2e3c",
          ironLight:      "#4a4a5c",
          gold:           "#c9a84c",
        }
      }
    }
  },

  plugins: [typography, forms]
} satisfies Config;
