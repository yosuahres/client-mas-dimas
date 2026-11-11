const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Subjects in this repo list every change in one line, so they run long.
    "header-max-length": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};

export default config;
