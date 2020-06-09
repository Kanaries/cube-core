module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  },
  browser: false,
  testPathIgnorePatterns: ["/node_modules/", "test/"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.ts"]
};
