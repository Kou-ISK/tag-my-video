import path from 'path';

// eslint-disable-next-line import/no-anonymous-default-export
const webpackConfig = [
    {
        mode: 'development',
        target: 'electron-main',
        entry: './electron/src/main.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'main.js',
        },
        // ... other configurations for the main process
        node: {
            __dirname: false,
            __filename: false,
        }
    },
    {
        mode: 'development',
        target: 'web', // Use 'web' target for renderer process
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'renderer.js',
        },
        resolve: {
            fallback: {
                "path": require.resolve("path-browserify")
            }
        },
        // ... other configurations for the renderer process
    }]

