var webpack = require('webpack');
var path = require('path');

dest = path.resolve(__dirname, '../SingularityService/target/generated-resources/assets');

module.exports = {
  entry: {
    app: './app/initialize.coffee',
    vendor: [
      'react',
      'jquery',
      'underscore',
      'clipboard',
      'select2',
      'handlebars',
      'moment',
      'messenger',
      'bootstrap',
      'classnames',
      'react-interval',
      'backbone-react-component',
      'react-dom',
      'fuzzy',
      'datatables',
      'sortable',
      'juration',
      'backbone',
      'vex-js'
    ],
  },
  output: {
    path: dest,
    filename: 'app.js'
  },
  debug: true,
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee'},
      { test: /\.hbs/, loader: "handlebars-template-loader" },
      { test: /[\/]messenger\.js$/, loader: 'exports?Messenger'},
      { test: /[\/]sortable\.js$/, loader: 'exports?Sortable'}
    ]
  },
  resolve: {
    root: path.resolve('./app'),
    extensions: ['', '.js', '.cjsx', '.coffee', '.hbs'],
    alias: {
      'vex': 'vex-js/js/vex.js',
      'vex.dialog': 'vex-helper.coffee',
      'handlebars': 'handlebars/runtime.js',
      'sortable': 'sortable/js/sortable.js',
      'datatables': 'datatables/media/js/jquery.dataTables.js',
      'bootstrap': 'bootstrap/dist/js/bootstrap.js'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      '_': 'underscore',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
  ]
};
