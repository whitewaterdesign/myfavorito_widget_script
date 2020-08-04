const path = require('path');

plugins: [
  new webpack.ProvidePlugin({
    App: path.resolve(__dirname, './path_to_App.js')
  })
]