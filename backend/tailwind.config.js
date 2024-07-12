/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html",
            "./dev/ts/**/*.ts"
  ],
  theme: {
       extend: {
      colors: {
        'skin-primary': '#f5f5ff',
        'skin-secondary': '#f0f0fc',
      },
      utilities:{
        
      }
    }
  },
  plugins: [],
}

