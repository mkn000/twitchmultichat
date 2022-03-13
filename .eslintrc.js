module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/vue3-essential", "google"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ["prettier"],
  rules: {
    "require-jsdoc": "off",
    "max-len": "off",
    "padded-blocks": "off",
    "no-console": "off",
    "space-unary-ops": "off",
    "eol-last": "off",
    "spaced-comment": "off",
    "func-names": "off",
    "no-param-reassign": "off",
    "space-before-function-paren": "off",
    "indent": ["error", 4, {"SwitchCase": 0}],
    "space-in-parens": "off",
    "linebreak-style": "off",
    "one-var": "off",
    "no-inline-comments": "off",
    "array-bracket-spacing": "off",
    "computed-property-spacing": "off",
    "one-var-declaration-per-line": "off",
    "quote-props": "always",
    strict: "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // disable the rule for all files
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": ["error"],
      },
    },
  ],
};
