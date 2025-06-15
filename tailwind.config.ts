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
        offwhite: "#acacac",
        sand: "#dca75b"
      }
    }
  },

  plugins: [typography, forms]
} satisfies Config;
