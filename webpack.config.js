const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const Dotenv = require("dotenv-webpack")

// eslint-disable-next-line no-unused-vars
module.exports = (env = {}, argv) => {
  return {
    entry: ["./src/index.js"],
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[hash].js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.css$/,
          use: [argv.mode === "development" ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: "url-loader", //  uses file loader if file size is bigger than defined
              options: {
                limit: 5000,
                name: "[name].[ext]",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[hash].css",
      }),
      new Dotenv({
        path: "./.env",
      }),
    ],
  }
}
