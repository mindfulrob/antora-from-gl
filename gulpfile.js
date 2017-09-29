'use strict'

const gulp = require('gulp')

const lint = require('./tasks/lint-task')
const format = require('./tasks/format-task')
const test = require('./tasks/test-task')
const commitlint = require('./tasks/commitlint-task')

const testFiles = ['test/**/*-test.js', 'packages/*/test/**/*-test.js']
const allFiles = ['gulpfile.js', '{lib*,tasks,test}/**/*.js', 'packages/*/{lib,test}/**/*.js']

gulp.task('lint', () => lint(allFiles))
gulp.task('format', () => format(allFiles))
gulp.task('test', ['lint'], () => test(testFiles))
gulp.task('test-only', () => test(testFiles))
gulp.task('test-watch', () => gulp.watch(allFiles, ['test-only']))
gulp.task('commitlint', () => commitlint())

gulp.task('default', ['test'])
