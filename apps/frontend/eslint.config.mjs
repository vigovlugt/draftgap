// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    // @ts-ignore
    solid.configs["flat/recommended"],
    globalIgnores(["dist", "tailwind.config.js"]),
    {
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
);
