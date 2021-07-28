const nodeExternals = require('webpack-node-externals');
const path = require("path");

module.exports = {
  "mode": "production",
  "entry": path.join(__dirname, "lib", "index.ts"),
  "target": "node",
  "externals": [nodeExternals()],
  "output": {
    "path": path.join(__dirname, "dist"),
    "filename": "index.js",
    "library": "json-schema-mapping",
    "libraryTarget": "umd",
  },
  "module": {
    "rules": [
      {
        "test": /\.(ts|js)$/,
        "exclude": /node_modules/,
        "use": [
          "babel-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.sparql$/,
        use: 'raw-loader',
      }
    ],
  },
  "resolve": {
    "extensions": [".ts", ".js", ".sparql"],
  },
};
