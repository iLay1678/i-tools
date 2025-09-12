import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // General code quality rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-extra-semi": "error",
      "no-unreachable": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      
      // Code style rules
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      
      // React specific rules that should be available
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    }
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**", 
      "out/**",
      "dist/**",
      "*.config.js",
      "*.config.ts",
      "next-env.d.ts"
    ]
  }
];

export default eslintConfig;