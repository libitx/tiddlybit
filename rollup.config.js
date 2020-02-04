import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'

export default  {
  input: 'index.js',
  output: {
    file: 'dist/tiddlybit.min.js',
    format: 'umd',
    name: 'TiddlyBit',
    exports: 'named'
  },
  
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
    }),
    terser({
      mangle: { reserved: ['TiddlyBit', 'Script', 'OpCode'] }
    }),
    banner('TiddlyBit - v<%= pkg.version %>\n<%= pkg.description %>\n<%= pkg.homepage %>\nCopyright © <%= new Date().getFullYear() %> <%= pkg.author %>. MIT License')
  ]
};