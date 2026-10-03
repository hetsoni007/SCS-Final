import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // three.js objects (uniforms, geometries, scratch vectors) are GPU-side resources that are
    // mutated in the frame loop by design. They are created once with useMemo and never drive
    // React rendering, so the React Compiler immutability rule does not apply to scene code.
    files: ["components/three/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // reference copies of the live site's inline scripts (not part of the build)
    "content/legacy-scripts/**",
    "playwright-report/**",
    "lhci-reports/**",
    ".lighthouseci/**",
    "test-results/**",
    ".lighthouseci/**",
  ]),
]);

export default eslintConfig;
