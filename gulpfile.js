const gulp = require("gulp");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const htmlclean = require("gulp-htmlclean");
const noop = require("gulp-noop");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const assets = require("postcss-assets");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const cssnano = require("cssnano");
const del = require("del");
const browserSync = require("browser-sync").create();
const copyfiles = require("copyfiles");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

const SRC = "./client/src/";
const DEST = "./client/build/";

const prodBuild = process.env.NODE_ENV !== "development";

const paths = {
  sourcemaps: "../maps/",
  images: {
    src: SRC + "images/*.{svg,png,jpg}",
    dest: DEST + "images/"
  },
  favicons: {
    src: SRC + "*.{png,jpg,svg}",
    dest: DEST
  },
  html: {
    src: SRC + "*.html",
    dest: DEST
  },
  styles: {
    src: SRC + "css/style.css",
    dest: DEST + "css/"
  },
  scripts: {
    src: ["formdata.min.js", "survey-form.js"].map(
      filename => SRC + "js/" + filename
    ),
    dest: DEST + "js/"
  }
};

async function images() {
  await gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));

  await copy(
    ["favicon.ico", "site.webmanifest", "browserconfig.xml"].map(
      filename => SRC + filename
    ),
    DEST
  );
}

function copy(paths, dest, opts = 2) {
  return new Promise((resolve, reject) => {
    try {
      copyfiles([...paths, dest], opts, resolve);
    } catch (e) {
      reject(e);
    }
  });
}

function favicons() {
  return gulp
    .src(paths.favicons.src)
    .pipe(newer(paths.favicons.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.favicons.dest));
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(prodBuild ? htmlclean() : noop())
    .pipe(gulp.dest(paths.html.dest));
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(prodBuild ? sourcemaps.init() : noop())
    .pipe(
      postcss(
        [
          assets({ loadPaths: [SRC + "images/"] }),
          autoprefixer(),
          mqpacker({
            sort: true
          }),
          prodBuild ? cssnano() : null
        ].filter(item => !!item)
      )
    )
    .pipe(prodBuild ? sourcemaps.write(paths.sourcemaps) : noop())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("all.js"))
    .pipe(prodBuild ? uglify() : noop())
    .pipe(sourcemaps.write(paths.sourcemaps))
    .pipe(gulp.dest(paths.scripts.dest));
}

function clean() {
  return del([DEST]);
}

function reload(done) {
  browserSync.reload();
  done();
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: DEST
    }
  });
  done();
}

function watch(done) {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.html.src, gulp.series(html, reload));
  gulp.watch(paths.images.src, gulp.series(images, reload));
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  done();
}

exports.default = gulp.series(
  clean,
  gulp.parallel(images, favicons, html, styles, scripts),
  serve,
  watch
);

exports.build = gulp.series(
  clean,
  gulp.parallel(images, favicons, html, styles, scripts)
);
