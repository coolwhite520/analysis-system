"use strict";

process.env.BABEL_ENV = "main";

const path = require("path");
const { dependencies } = require("../package.json");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const JavaScriptObfuscator = require("webpack-obfuscator");
let mainConfig = {
  entry: {
    main: path.join(__dirname, "../src/main/main.js"),
  },
  externals: [...Object.keys(dependencies || {})],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== "production",
    __filename: process.env.NODE_ENV !== "production",
  },
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "../dist/electron"),
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    // new ParallelUglifyPlugin({
    //   test: /\.js$/,
    //   exclude: /node_modules/,
    //   uglifyES: {},
    // }),
  ],
  resolve: {
    extensions: [".js", ".json", ".node"],
  },
  target: "electron-main",
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== "production") {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, "../static").replace(/\\/g, "\\\\")}"`,
    })
  );
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === "production") {
  mainConfig.plugins.push(
    new MinifyPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"',
    })
  );
}
// 打包的时候才进行代码混淆
if (process.env.NODE_ENV === "production") {
  mainConfig.plugins.push(
    new JavaScriptObfuscator({
      rotateStringArray: true,
    })
  );
}
module.exports = mainConfig;
