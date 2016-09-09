// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as ExtractTextPlugin
  from 'extract-text-webpack-plugin';

import * as webpack
  from 'webpack';

import {
  Config
} from 'webpack-config';

import {
  JupyterLabPlugin
} from './plugin';


/**
 * Build a JupyterLab extension.
 *
 * @param name - The name of the extension.
 *
 * @param entryPath - The path to the entry point file.
 *
 * @param extras - Optional WebPack config to be merged with the defaults.
 *
 * #### Notes
 * The loading of all CSS files is handled by the extension builder, and cannot
 * be overriden using this function.
 */
export
function buildExtension(options: IBuildOptions) {
  let name = options.name;
  let entry: { [key: string]: string } = {};
  entry[name] = options.entryPath;

  let config = new Config().merge({ entry: entry }).merge({
    output: {
      path: __dirname + '/build',
      filename: '[name].bundle.js',
      publicPath: 'labextension/[name]'
    },
    node: {
      fs: 'empty'
    },
    debug: true,
    bail: true,
    plugins: [new JupyterLabPlugin()]
  }).merge(options.config || {});

  // Add the CSS extractors unless explicitly told otherwise.
  if (options.extractCSS !== false) {
    let loader: any = ExtractTextPlugin.extract('style-loader', 'css-loader',
      { publicPath: './' });
    config.merge({
      module: {
        loaders: [{ test: /\.css$/, loader: loader }]
      },
      plugins: [new ExtractTextPlugin('[name].css')]
    });
  }

  let compiler = webpack(config);
  compiler.context = name;
  compiler.run(function(err, stats) {
    if (err) {
      console.error(err.message);
    } else {
      console.log('\n\nSuccess fully built "' + name + '":\n');
      process.stdout.write(stats.toString({
        chunks: true,
        modules: false,
        chunkModules: false,
        colors: require('supports-color')
      }) + '\n');
    }
  });
}


/**
 * The options used to build a JupyterLab extension.
 */
export
interface IBuildOptions {
  /**
   * The name of the extension.
   */
  name: string;

  /**
   * The path to the entry point.
   */
  entryPath: string;

  /**
   * Whether to extract CSS from the bundles (default is True).
   *
   * Note: no other CSS loaders should be used if set to True.
   */
  extractCSS?: boolean;

  /**
   * Extra webpack configuration.
   */
  config?: webpack.Configuration;
}
