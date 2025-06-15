import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        primary: "#b6b6b6",
        secondary: "#5b5b5b",
        accent: "#00b4ff",
        offwhite: "#acacac"
      }
    }
  },

  plugins: [typography, forms]
} satisfies Config;
