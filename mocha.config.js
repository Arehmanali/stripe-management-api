const register = require('ts-node').register;
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

require('tsconfig-paths/register');

// Handle ts file extensions
require.extensions['.ts'] = require.extensions['.js'];
