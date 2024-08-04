const getWebpackWatchOptions = (ignored = []) => ({
  // aggregateTimeout: 200, // 300ms for smaller projects, 1000ms for bigger projects
  // aggregateTimeout: 50, // 300ms for smaller projects, 1000ms for bigger projects
  aggregateTimeout: 5, // 5ms nextjs
  // debug node_modules package with console.log
  // ignored: /node_modules(?!\/react-ga4)/,
  ignored: [
    '**/node_modules',
    '**/build',
    '**/.jest-cache',
    '**/dist',
    '**/.webpack',
    '**/.cache',
    '**/cache',
    '**/public',
    '**/docs-build',
    '**/.idea',
    '**/prettier',
    '**/dist-storybook',
    '**/.docusuarus',
    '**/.next',
    '**/coverage',
    '**/.eslintcache',
    '**/build-server',
    '**/.docusuarus',
    '**/yarn-error.log',
    '**/.docusuarus',
    '**/turbo-build.log',
    '**/.turbo',
    '**/__tests__',
    'CHANGELOG.md',
    '*.log',
    '*.swp',
    '*.tmp',
    ...ignored,
  ],
});

module.exports.getWebpackWatchOptions = getWebpackWatchOptions;
