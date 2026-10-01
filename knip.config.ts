import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/index.html',
    'src/styles/main.css',
    // Standalone scripts invoked directly (not imported by other modules)
    'scripts/**/*.ts',
  ],
  project: ['src/**/*.{ts,css}', 'scripts/**/*.ts'],
  ignoreDependencies: [
    // Global GeoJSON namespace, referenced without an import
    '@types/geojson',
  ],
  ignoreBinaries: [
    'cz', // commitizen CLI
  ],
  ignoreExportsUsedInFile: true,
};

export default config;
