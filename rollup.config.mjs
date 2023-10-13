import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import watchGlobs from 'rollup-plugin-watch-globs';

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
    liveReloadEnabled &&
      watchGlobs(['src/templates/**/*.hbs', 'src/styles/**/*.scss']),
    typescript(),
    scss({ fileName: 'bundle.css' }),
    !liveReloadEnabled && terser(),
    copyStaticFiles(),
    liveReloadEnabled &&
      livereload({
        delay: 200,
      }),
  ],
};
