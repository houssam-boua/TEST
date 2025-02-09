/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // theme: {
  //   extend: {},
  //   colors: {
  //     "royal-blue": {
  //       50: "#edf0ff",
  //       100: "#dee4ff",
  //       200: "#c4ccff",
  //       300: "#a0aaff",
  //       400: "#696cff",
  //       500: "#635bf9",
  //       600: "#543dee",
  //       700: "#482fd3",
  //       800: "#3a29aa",
  //       900: "#332986",
  //       950: "#20184e",
  //     },
  //     "regent-gray": {
  //       50: "#f5f7f8",
  //       100: "#edf0f2",
  //       200: "#dde4e8",
  //       300: "#c8d3d9",
  //       400: "#b1bec8",
  //       500: "#9daab7",
  //       600: "#8592a3",
  //       700: "#737f8f",
  //       800: "#5f6874",
  //       900: "#50575f",
  //       950: "#2f3337",
  //     },
  //     scooter: {
  //       50: "#ecfdff",
  //       100: "#cefaff",
  //       200: "#a4f1fd",
  //       300: "#65e5fb",
  //       400: "#1fcff1",
  //       500: "#03c3ec",
  //       600: "#058eb5",
  //       700: "#0c7192",
  //       800: "#135c77",
  //       900: "#154d64",
  //       950: "#073145",
  //     },
  //     malachite: {
  //       50: "#f1fde8",
  //       100: "#dffacd",
  //       200: "#c1f5a1",
  //       300: "#99ec6a",
  //       400: "#71dd37",
  //       500: "#55c41e",
  //       600: "#3f9c14",
  //       700: "#317714",
  //       800: "#2b5e16",
  //       900: "#265017",
  //       950: "#102c07",
  //     },
  //     "yellow-sea": {
  //       50: "#fffdea",
  //       100: "#fff6c5",
  //       200: "#ffee85",
  //       300: "#ffdf46",
  //       400: "#ffcd1b",
  //       500: "#ffab00",
  //       600: "#e28200",
  //       700: "#bb5a02",
  //       800: "#984508",
  //       900: "#7c390b",
  //       950: "#481c00",
  //     },
  //     pomegranate: {
  //       50: "#fff2ed",
  //       100: "#ffe2d4",
  //       200: "#ffc0a8",
  //       300: "#ff9470",
  //       400: "#ff5c37",
  //       500: "#ff3e1d",
  //       600: "#f01806",
  //       700: "#c70c07",
  //       800: "#9e0e10",
  //       900: "#7f0f10",
  //       950: "#450508",
  //     },
  //     "athens-gray": {
  //       50: "#f6f7f8",
  //       100: "#e9eaec",
  //       200: "#dcdee1",
  //       300: "#c4c7cc",
  //       400: "#a7abb3",
  //       500: "#9196a0",
  //       600: "#808390",
  //       700: "#737682",
  //       800: "#61636c",
  //       900: "#505158",
  //       950: "#333438",
  //     },
  //     "big-stone": {
  //       50: "#f5f8fa",
  //       100: "#eaeff4",
  //       200: "#cfdde8",
  //       300: "#a5c0d4",
  //       400: "#759ebb",
  //       500: "#5483a3",
  //       600: "#416988",
  //       700: "#35546f",
  //       800: "#2f485d",
  //       900: "#2b3e4f",
  //       950: "#22303e",
  //     },
  //     bodyBg: "#f5f5f9",
  //     paperBg: "#ffffff",
  //     tableHeader: "#ffffff",
  //   },
  //   fontFamily: {
  //     sans: ["Public Sans", "sans-serif"],
  //   },
  //   fontWeight: {
  //     light: 400,
  //     normal: 500,
  //   },
  //   fontSize: {
  //     h1: ["2.875rem", { lineHeight: "4.25rem" }],
  //     h2: ["2.25rem", { lineHeight: "3.5rem" }],
  //     h3: ["1.75rem", { lineHeight: "2.75rem" }],
  //     h4: ["1.5rem", { lineHeight: "2.25rem" }],
  //     h5: ["1.25rem", { lineHeight: "1.75rem" }],
  //     h6: ["1rem", { lineHeight: "1.5rem" }],
  //     subtitle1: ["1rem", { lineHeight: "1.5rem" }],
  //     subtitle2: ["0.875rem", { lineHeight: "1.25rem" }],
  //     body1: ["1rem", { lineHeight: "1.5rem" }],
  //     body2: ["0.875rem", { lineHeight: "1.25rem" }],
  //     caption: ["0.875rem", { lineHeight: "1.25rem" }],
  //     overline: ["0.75rem", { lineHeight: "1rem" }],
  //   },

  //   opacity: {
  //     8: "0.08",
  //     16: "0.16",
  //     24: "0.24",
  //     32: "0.32",
  //     38: "0.38",
  //   },
  //   borderRadius: {
  //     none: "0",
  //     sm: "0.125rem",
  //     DEFAULT: "0.375rem",
  //     md: "0.5rem",
  //     lg: "0.75rem",
  //     xl: "1rem",
  //     "2xl": "1.5rem",
  //   },
  // },
  plugins: [require("daisyui")],
  daisyui: {
    // themes: [
    //   {
    //     mytheme: {
    //       primary: "#696cff",
    //       "primary-content": "#384551",

    //       secondary: "#8592a3",
    //       "secondary-content": "#646e78",

    //       accent: "#8885FA",

    //       "accent-content": "#FFF5FE",

    //       neutral: "#E5E7EB",

    //       "neutral-content": "#151516",

    //       "base-100": "#F3F4F6",

    //       "base-200": "#ECEFF4",

    //       "base-300": "#8E8E9E",

    //       "base-content": "#4A4B65",

    //       info: "#03c3ec",

    //       "info-content": "#ffffff",

    //       success: "#71dd37",

    //       "success-content": "#ffffff",

    //       warning: "#ffab00",

    //       "warning-content": "#ffffff",

    //       error: "#ff3e1d",

    //       "error-content": "#ffffff",
    //     },
    //   },
    // ],
    // themes: ["light", "dark", "corporate"],

    themes: [
      {
        mytheme: {
          primary: "#048BB1",

          "primary-content": "#CDEAF0",

          secondary: "#CDEAF0",

          "secondary-content": "#123440",

          accent: "#CDEAF0",

          "accent-content": "#123440",

          neutral: "#B5B8BB",

          "neutral-content": "#A2A4A3",

          "base-100": "#B5B8BB",

          "base-200": "#A2A4A3",

          "base-300": "#889290",

          "base-content": "#A2A4A3",

          info: "#2C84DA",

          "info-content": "#6D7AFD",

          success: "#4BA40C",

          "success-content": "#020F08",

          warning: "#F9BB32",

          "warning-content": "#120a01",

          error: "#DE3531",

          "error-content": "#110202",
        },
      },
    ],
  },
};
