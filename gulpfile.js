var gulp = require('gulp');
var browserify = require('gulp-browserify');

var config = {
	scripts: {
		src: '_browserify/',
		output: 'js/'
	}
};

// Basic usage 
gulp.task('scripts', function() {
	// Single entry point to browserify
	gulp.src(config.scripts.src+'app.jsx')
		.pipe(browserify({
			insertGlobals : true
		}))
		.pipe(gulp.dest('./build/js'))
});