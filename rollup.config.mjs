import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';

const liveReloadEnabled = !!process.env.ROLLUP_WATCH;

const copyStaticFiles = () => {
  return copy({
    targets: [{ src: 'lang', dest: 'dist' }],
    targets: [{ src: 'src/templates', dest: 'dist' }],
    verbose: true,
  });
};

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    scss({ fileName: 'bundle.css' }),
    !liveReloadEnabled && terser(),
    copyStaticFiles(),
    liveReloadEnabled &&
      livereload({
        watch: ['src/templates/**/*', 'src/styles/**/*'],
        delay: 500,
      }),
  ],
};
