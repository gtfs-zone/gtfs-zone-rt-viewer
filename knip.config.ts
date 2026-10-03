import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.html', 'src/styles/main.css'],
  project: ['src/**/*.{ts,css}'],
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
