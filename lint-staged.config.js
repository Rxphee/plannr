module.exports = {
    "api/src/**/*.{ts,tsx,js,jsx,json,css,md}": () => ["npm --prefix api run lint:eslint", "npm --prefix api run lint:knip"],
    "api/**/*.{ts,tsx}": () => "npm --prefix api run lint:tsc",
    "api/*.{ts,js,json,md,yml,yaml}": () => "npm --prefix api run lint:prettier",
    "web/src/**/*.{ts,tsx,js,jsx,json,css,md}": () => ["npm --prefix web run lint:eslint", "npm --prefix web run lint:knip"],
    "web/**/*.{ts,tsx}": () => "npm --prefix web run lint:tsc",
    "web/*.{ts,js,mjs,json,md,yml,yaml,css}": () => "npm --prefix web run lint:prettier",
    "./**/*.{ts,mts,cts,js,mjs,cjs,json,md,yml,yaml}": () => "npm run lint:root",
};
