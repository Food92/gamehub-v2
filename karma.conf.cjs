module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      { pattern: "test/**/*.spec.js", watched: false, type: "module" },
      { pattern: "src/**/*.spec.js", watched: false, type: "module" },
    ],
    preprocessors: {
      "test/**/*.spec.js": ["esbuild"],
      "src/**/*.spec.js": ["esbuild"],
    },
    esbuild: {
      target: "es2022",
      jsx: "automatic",
      loader: { ".js": "jsx", ".css": "empty" },
    },
    reporters: ["progress"],
    browsers: ["Chrome"],
    singleRun: false,
    autoWatch: true,
    restartOnFileChange: false,
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-esbuild"),
    ],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: 1,
  });
};
