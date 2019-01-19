module.exports = {
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "shared-node-browser": true,
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true,
    "jest": true,
    "mongo": true,
    "jquery": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "eqeqeq": [
      2,
      "allow-null"
    ],
    "no-console": "off",
    "no-unused-vars": [
      "warn",
      {
        "vars": "local",
        "args": "after-used",
        "ignoreRestSiblings": false
      }
    ],
    "no-eval": "error",
    "quotes": [
      2,
      "single",
      "avoid-escape"
    ],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "semi": [
      "error",
      "always"
    ]
  }
}
