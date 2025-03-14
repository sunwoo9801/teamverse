// export default {
//     plugins: {
//       tailwindcss: {},
//       autoprefixer: {},
//     },
//   };
  
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
    // 다른 플러그인이 있다면 추가
  ],
};
