/* eslint-env mocha */
'use strict'

const { expect } = require('../../../test/test-utils')

const buildPlaybook = require('@antora/playbook-builder')
const getLogger = require('@antora/logger')
const ospath = require('path')

const FIXTURES_DIR = ospath.join(__dirname, 'fixtures')

describe('buildPlaybook()', () => {
  let schema, expectedPlaybook

  beforeEach(() => {
    schema = {
      playbook: {
        format: String,
        default: undefined,
        env: 'PLAYBOOK',
      },
      one: {
        one: {
          format: String,
          default: null,
          arg: 'one-one',
          env: 'ANTORA_ONE_ONE',
        },
        two: {
          format: String,
          default: 'default-value',
        },
        widget_key: {
          format: String,
          default: undefined,
          env: 'WIDGET_KEY',
        },
      },
      two: {
        format: Number,
        default: null,
        arg: 'two',
        env: 'ANTORA_TWO',
      },
      three: {
        format: Boolean,
        default: null,
        arg: 'three',
        env: 'ANTORA_THREE',
      },
      four: {
        format: Array,
        default: null,
      },
      keyvals: {
        format: 'map',
        default: {},
        arg: 'keyval',
        env: 'KEYVALS',
      },
      keyvals2: {
        format: String,
        default: undefined,
      },
    }

    expectedPlaybook = {
      one: {
        two: 'default-value',
        widgetKey: undefined,
      },
      two: 42,
      three: false,
      four: [
        { lastname: 'Lennon', name: 'John' },
        { lastname: 'McCartney', name: 'Paul' },
      ],
      keyvals: {},
      keyvals2: undefined,
    }
  })

  const ymlSpec = ospath.join(FIXTURES_DIR, 'spec-sample.yml')
  const yamlSpec = ospath.join(FIXTURES_DIR, 'spec-sample.yaml')
  const extensionlessSpec = ospath.join(FIXTURES_DIR, 'spec-sample')
  const extensionlessJsonSpec = ospath.join(FIXTURES_DIR, 'spec-sample-json')
  const extensionlessTomlSpec = ospath.join(FIXTURES_DIR, 'spec-sample-toml')
  const jsonSpec = ospath.join(FIXTURES_DIR, 'spec-sample.json')
  const tomlSpec = ospath.join(FIXTURES_DIR, 'spec-sample.toml')
  const iniSpec = ospath.join(FIXTURES_DIR, 'spec-sample.ini')
  const badSpec = ospath.join(FIXTURES_DIR, 'bad-spec-sample.yml')
  const coerceValueSpec = ospath.join(FIXTURES_DIR, 'coerce-value-spec-sample.yml')
  const invalidPrimitiveMapSpec = ospath.join(FIXTURES_DIR, 'invalid-primitive-map-spec-sample.yml')
  const invalidMapSpec = ospath.join(FIXTURES_DIR, 'invalid-map-spec-sample.yml')
  const nullMapSpec = ospath.join(FIXTURES_DIR, 'null-map-spec-sample.yml')
  const invalidDirOrFilesSpec = ospath.join(FIXTURES_DIR, 'invalid-dir-or-files-spec-sample.yml')
  const invalidStringOrBooleanSpec = ospath.join(FIXTURES_DIR, 'invalid-string-or-boolean-spec-sample.yml')
  const runtimeLogFormatSpec = ospath.join(FIXTURES_DIR, 'runtime-log-format-spec-sample.yml')
  const legacyGitEnsureGitSuffixSpec = ospath.join(FIXTURES_DIR, 'legacy-git-ensure-git-suffix-sample.yml')
  const legacyRuntimePullSpec = ospath.join(FIXTURES_DIR, 'legacy-runtime-pull-sample.yml')
  const legacyUiBundleSpec = ospath.join(FIXTURES_DIR, 'legacy-ui-bundle-sample.yml')
  const legacyUiStartPathSpec = ospath.join(FIXTURES_DIR, 'legacy-ui-start-path-sample.yml')
  const invalidSiteUrlSpec = ospath.join(FIXTURES_DIR, 'invalid-site-url-spec-sample.yml')
  const defaultSchemaSpec = ospath.join(FIXTURES_DIR, 'default-schema-spec-sample.yml')

  it('should set dir to process.cwd() when playbook file is not specified', () => {
    const playbook = buildPlaybook([], {}, { playbook: { format: String, default: undefined } })
    expect(playbook.dir).to.equal(process.cwd())
    expect(playbook.file).to.not.exist()
  })

  it('should set dir and file properties based on absolute path of playbook file', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ospath.relative('.', ymlSpec) }, schema)
    expect(playbook.dir).to.equal(ospath.dirname(ymlSpec))
    expect(playbook.file).to.equal(ymlSpec)
    expect(playbook.playbook).to.not.exist()
  })

  it('should assign second positional argument to non-enumerable env property', () => {
    const playbook = buildPlaybook([], process.env, { playbook: { format: String, default: undefined } })
    expect(playbook.env).to.equal(process.env)
    try {
      process.env.TMP_ENV_VAR = 'value'
      expect(playbook.env.TMP_ENV_VAR).to.equal('value')
    } finally {
      delete process.env.TMP_ENV_VAR
    }
    expect(Object.keys(playbook)).to.not.include('env')
  })

  it('should set env property to empty object if second positional argument is undefined', () => {
    const playbook = buildPlaybook([], undefined, { playbook: { format: String, default: undefined } })
    expect(playbook.env).to.eql({})
  })

  it('should load YAML playbook file with .yml extension', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(ymlSpec)
    expectedPlaybook.file = ymlSpec
    expectedPlaybook.one.one = 'yml-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should load YAML playbook file with .yaml extension', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: yamlSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(yamlSpec)
    expectedPlaybook.file = yamlSpec
    expectedPlaybook.one.one = 'yaml-spec-value-one'
    expectedPlaybook.four = [
      { lastname: 'Starr', name: 'Ringo' },
      { lastname: 'Harrison', name: 'George' },
    ]
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should load JSON (JSON 5) playbook file', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: jsonSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(jsonSpec)
    expectedPlaybook.file = jsonSpec
    expectedPlaybook.one.one = 'json-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should load TOML playbook file', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: tomlSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(tomlSpec)
    expectedPlaybook.file = tomlSpec
    expectedPlaybook.one.one = 'toml-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should load YAML playbook file first when no file extension is given', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: extensionlessSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(extensionlessSpec)
    expectedPlaybook.file = extensionlessSpec + '.yml'
    expectedPlaybook.one.one = 'yml-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should discover JSON playbook when no file extension is given', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: extensionlessJsonSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(extensionlessJsonSpec)
    expectedPlaybook.file = extensionlessJsonSpec + '.json'
    expectedPlaybook.one.one = 'json-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should discover TOML playbook when no file extension is given', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: extensionlessTomlSpec }, schema)
    expectedPlaybook.dir = ospath.dirname(extensionlessTomlSpec)
    expectedPlaybook.file = extensionlessTomlSpec + '.toml'
    expectedPlaybook.one.one = 'toml-spec-value-one'
    expect(playbook).to.eql(expectedPlaybook)
  })

  it('should throw error when loading unknown type file', () => {
    expect(() => buildPlaybook([], { PLAYBOOK: iniSpec }, schema)).to.throw('Unexpected playbook file type')
  })

  it('should throw error if specified playbook file does not exist', () => {
    const expectedMessage =
      `playbook file not found at ${ospath.resolve('non-existent/file.yml')} ` +
      `(path: non-existent/file.yml, cwd: ${process.cwd()})`
    expect(() => buildPlaybook([], { PLAYBOOK: 'non-existent/file.yml' }, schema)).to.throw(expectedMessage)
  })

  it('should not show details in error message if input path of playbook file matches resolved path', () => {
    const playbookFilePath = ospath.resolve('non-existent/file.yml')
    const expectedMessage = `playbook file not found at ${playbookFilePath}`
    // FIXME: technically this does not assert that the details are absent
    expect(() => buildPlaybook([], { PLAYBOOK: playbookFilePath }, schema)).to.throw(expectedMessage)
  })

  it('should not show cwd in error message if input path of playbook file is absolute', () => {
    const playbookFilePath = ospath.resolve('non-existent/file.yml')
    const requestedPlaybookFilePath = [process.cwd(), 'non-existent', '..', 'non-existent/file.yml'].join(ospath.sep)
    const expectedMessage = `playbook file not found at ${playbookFilePath} (path: ${requestedPlaybookFilePath})`
    expect(() => buildPlaybook([], { PLAYBOOK: requestedPlaybookFilePath }, schema)).to.throw(expectedMessage)
  })

  it('should throw error if playbook file without extension cannot be resolved', () => {
    const resolvedRootPath = ospath.resolve('non-existent/file')
    const expectedMessage =
      'playbook file not found at ' +
      `${resolvedRootPath}.yml, ${resolvedRootPath}.json, or ${resolvedRootPath}.toml` +
      ` (path: non-existent/file, cwd: ${process.cwd()})`
    expect(() => buildPlaybook([], { PLAYBOOK: 'non-existent/file' }, schema)).to.throw(expectedMessage)
  })

  it('should use default value if playbook file is not specified', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)
    expect(playbook.one.two).to.equal('default-value')
  })

  it('should use env value over value in playbook file', () => {
    const env = { PLAYBOOK: ymlSpec, ANTORA_ONE_ONE: 'the-env-value' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.one.one).to.equal('the-env-value')
  })

  it('should use env value over value in playbook file when env value is empty string', () => {
    const env = { PLAYBOOK: ymlSpec, ANTORA_ONE_ONE: '' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.one.one).to.equal('')
  })

  it('should use args value over value in playbook file or env value even if value is falsy', () => {
    const args = ['--one-one', 'the-args-value']
    const env = { PLAYBOOK: ymlSpec, ANTORA_ONE_ONE: 'the-env-value' }
    const playbook = buildPlaybook(args, env, schema)
    expect(playbook.one.one).to.equal('the-args-value')
  })

  it('should use arg value over value in playbook file when arg value is falsy', () => {
    const args = ['--two', '0']
    const env = { PLAYBOOK: ymlSpec, ANTORA_TWO: '47' }
    const playbook = buildPlaybook(args, env, schema)
    expect(playbook.two).to.equal(0)
  })

  it('should convert properties of playbook to camelCase', () => {
    const env = { PLAYBOOK: ymlSpec, WIDGET_KEY: 'xxxyyyzzz' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.one.widgetKey).to.equal('xxxyyyzzz')
  })

  it('should coerce Number values in playbook file', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)
    expect(playbook.two).to.equal(42)
  })

  it('should coerce Number values in env', () => {
    const env = { PLAYBOOK: ymlSpec, ANTORA_TWO: '777' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.two).to.equal(777)
  })

  it('should use env value over value in playbook file when env value is falsy', () => {
    const env = { PLAYBOOK: ymlSpec, ANTORA_TWO: '0' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.two).to.equal(0)
  })

  it('should coerce Number values in args', () => {
    const playbook = buildPlaybook(['--two', '777'], { PLAYBOOK: ymlSpec }, schema)
    expect(playbook.two).to.equal(777)
  })

  it('should coerce Boolean values in playbook file', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)
    expect(playbook.three).to.be.false()
  })

  it('should coerce Boolean values in env', () => {
    const env = { PLAYBOOK: ymlSpec, ANTORA_THREE: 'true' }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.three).to.be.true()
  })

  it('should coerce Boolean values in args', () => {
    const playbook = buildPlaybook(['--three'], { PLAYBOOK: ymlSpec }, schema)
    expect(playbook.three).to.be.true()
  })

  it('should coerce primitive map value in playbook file from Object', () => {
    schema.keyvals.format = 'primitive-map'
    const playbook = buildPlaybook([], { PLAYBOOK: coerceValueSpec }, schema)
    expect(playbook.keyvals).to.eql({ key: 'val', keyOnly: '', foo: 'bar', nada: null, yep: true, nope: false })
  })

  it('should throw error if value of primitive map key is a String', () => {
    schema.keyvals2.format = 'primitive-map'
    expect(() => buildPlaybook([], { PLAYBOOK: coerceValueSpec }, schema)).to.throw(
      'must be a primitive map (i.e., key/value pairs, primitive values only)'
    )
  })

  it('should coerce primitive map value in env', () => {
    schema.keyvals.format = 'primitive-map'
    const val = 'key=val,key-only,=valonly,empty=,tilde="~",site_tags="a,b,c",nada=~,y=true,n=false,when=2020-01-01'
    const env = { PLAYBOOK: ymlSpec, KEYVALS: val }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.keyvals).to.eql({
      key: 'val',
      keyOnly: '',
      empty: '',
      tilde: '~',
      siteTags: 'a,b,c',
      nada: null,
      y: true,
      n: false,
      when: '2020-01-01',
    })
  })

  it('should coerce primitive map value in args', () => {
    schema.keyvals.format = 'primitive-map'
    const playbook = buildPlaybook(
      [
        '--keyval',
        'key=val',
        '--keyval',
        'key-only',
        '--keyval',
        '=valonly',
        '--keyval',
        'empty=',
        '--keyval',
        'tilde="~"',
        '--keyval',
        'site_tags="a,b,c"',
        '--keyval',
        'nada=~',
        '--keyval',
        'y=true',
        '--keyval',
        'n=false',
        '--keyval',
        'when=2020-01-01',
      ],
      { PLAYBOOK: ymlSpec },
      schema
    )
    expect(playbook.keyvals).to.eql({
      key: 'val',
      keyOnly: '',
      empty: '',
      tilde: '~',
      siteTags: 'a,b,c',
      nada: null,
      y: true,
      n: false,
      when: '2020-01-01',
    })
  })

  it('should use primitive map value in args to update map value from playbook file', () => {
    schema.keyvals.format = 'primitive-map'
    const args = ['--keyval', 'foo=baz', '--keyval', 'key-only=useme']
    const playbook = buildPlaybook(args, { PLAYBOOK: coerceValueSpec }, schema)
    expect(playbook.keyvals.key).to.equal('val')
    expect(playbook.keyvals.keyOnly).to.equal('useme')
    expect(playbook.keyvals.foo).to.equal('baz')
  })

  it('should throw error if value of primitive map key is not an object', () => {
    schema.keyvals.format = 'primitive-map'
    expect(() => buildPlaybook([], { PLAYBOOK: invalidMapSpec }, schema)).to.throw(
      'must be a primitive map (i.e., key/value pairs, primitive values only)'
    )
  })

  it('should throw error if value of primitive map key is not primitive', () => {
    schema.keyvals.format = 'primitive-map'
    expect(() => buildPlaybook([], { PLAYBOOK: invalidPrimitiveMapSpec }, schema)).to.throw(
      'must be a primitive map (i.e., key/value pairs, primitive values only)'
    )
  })

  it('should allow value of primitive map key to be null', () => {
    schema.keyvals.format = 'primitive-map'
    const playbook = buildPlaybook([], { PLAYBOOK: nullMapSpec }, schema)
    expect(playbook.keyvals).to.be.null()
  })

  it('should coerce map value in playbook file from Object', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: coerceValueSpec }, schema)
    expect(playbook.keyvals).to.eql({ key: 'val', keyOnly: '', foo: 'bar', nada: null, yep: true, nope: false })
  })

  it('should throw error if value of map key is a String', () => {
    schema.keyvals2.format = 'map'
    expect(() => buildPlaybook([], { PLAYBOOK: coerceValueSpec }, schema)).to.throw(
      'must be a map (i.e., key/value pairs)'
    )
  })

  it('should coerce map value in env', () => {
    const val = 'key=val,key-only,=valonly,empty=,tilde="~",site_tags="a,b,c",nada=~,y=true,n=false'
    const env = { PLAYBOOK: ymlSpec, KEYVALS: val }
    const playbook = buildPlaybook([], env, schema)
    expect(playbook.keyvals).to.eql({
      key: 'val',
      keyOnly: '',
      empty: '',
      tilde: '~',
      siteTags: 'a,b,c',
      nada: null,
      y: true,
      n: false,
    })
  })

  it('should coerce map value in args', () => {
    const playbook = buildPlaybook(
      [
        '--keyval',
        'key=val',
        '--keyval',
        'key-only',
        '--keyval',
        '=valonly',
        '--keyval',
        'empty=',
        '--keyval',
        'tilde="~"',
        '--keyval',
        'site_tags="a,b,c"',
        '--keyval',
        'nada=~',
        '--keyval',
        'y=true',
        '--keyval',
        'n=false',
      ],
      { PLAYBOOK: ymlSpec },
      schema
    )
    expect(playbook.keyvals).to.eql({
      key: 'val',
      keyOnly: '',
      empty: '',
      tilde: '~',
      siteTags: 'a,b,c',
      nada: null,
      y: true,
      n: false,
    })
  })

  it('should use map value in args to update map value from playbook file', () => {
    const playbook = buildPlaybook(['--keyval', 'foo=baz'], { PLAYBOOK: coerceValueSpec }, schema)
    expect(playbook.keyvals.key).to.equal('val')
    expect(playbook.keyvals.foo).to.equal('baz')
  })

  it('should update map value from playbook file with map values in args when name is asciidoc.attributes', () => {
    const args = ['--playbook', defaultSchemaSpec, '--attribute', 'idprefix=user-', '--attribute', 'idseparator=-']
    const playbook = buildPlaybook(args, {})
    expect(playbook.asciidoc.attributes).to.eql({
      'allow-uri-read': true,
      idprefix: 'user-',
      idseparator: '-',
      toc: false,
      'uri-project': 'https://antora.org',
    })
  })

  it('should throw error if value of map key is not an object', () => {
    expect(() => buildPlaybook([], { PLAYBOOK: invalidMapSpec }, schema)).to.throw(
      'must be a map (i.e., key/value pairs)'
    )
  })

  it('should allow value of map key to be null', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: nullMapSpec }, schema)
    expect(playbook.keyvals).to.be.null()
  })

  it('should coerce String value to Array', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: coerceValueSpec }, schema)
    expect(playbook.file).to.equal(coerceValueSpec)
    expect(playbook.dir).to.equal(ospath.dirname(coerceValueSpec))
    expect(playbook.one.one).to.equal('one')
    expect(playbook.four).to.eql(['John'])
  })

  it('should throw error if dir-or-virtual-files key is not a string or array', () => {
    Object.keys(schema).forEach((key) => {
      if (key !== 'playbook') delete schema[key]
    })
    schema.files = {
      format: 'dir-or-virtual-files',
      default: undefined,
    }
    expect(() => buildPlaybook([], { PLAYBOOK: invalidDirOrFilesSpec }, schema)).to.throw(
      'must be a directory path or list of virtual files'
    )
  })

  it('should throw error when trying to load values not declared in the schema', () => {
    expect(() => buildPlaybook([], { PLAYBOOK: badSpec }, schema)).to.throw('not declared')
  })

  it('should throw error when playbook file uses values of the wrong format', () => {
    schema.two.format = String
    expect(() => buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)).to.throw('must be of type String')
  })

  it('should return an immutable playbook', () => {
    const playbook = buildPlaybook([], { PLAYBOOK: ymlSpec }, schema)
    expect(() => {
      playbook.one.two = 'override'
    }).to.throw()
  })

  it('should use default schema if no schema is specified', () => {
    const playbook = buildPlaybook(['--playbook', defaultSchemaSpec], {})
    expect(playbook.runtime.cacheDir).to.equal('./.antora-cache')
    expect(playbook.runtime.fetch).to.be.true()
    expect(playbook.runtime.quiet).to.be.false()
    expect(playbook.runtime.silent).to.be.false()
    expect(playbook.runtime.log.level).to.equal('info')
    expect(playbook.runtime.log.levelFormat).to.equal('number')
    expect(playbook.runtime.log.failureLevel).to.equal('warn')
    expect(playbook.runtime.log.format).to.equal('json')
    expect(playbook.runtime.log.destination.file).to.equal('stdout')
    expect(playbook.runtime.log.destination.bufferSize).to.equal(4096)
    expect(playbook.runtime.log.destination.sync).to.equal(false)
    expect(playbook.runtime.log.destination.append).to.equal(false)
    expect(playbook.network.httpProxy).to.equal('http://proxy.example.org')
    expect(playbook.network.httpsProxy).to.equal('http://proxy.example.org')
    expect(playbook.network.noProxy).to.equal('example.org,example.com')
    expect(playbook.pipeline.extensions).to.eql([
      'antora-lunr',
      {
        require: '.:pdf-exporter',
        configPath: './pdf-config.yml',
        data: { key_name: 'value' },
      },
    ])
    expect(playbook.site.url).to.equal('https://example.com')
    expect(playbook.site.title).to.equal('Example site')
    expect(playbook.site.startPage).to.equal('1.0@server::intro')
    expect(playbook.site.keys.googleAnalytics).to.equal('XX-123456')
    expect(playbook.site.keys.jiraCollectorId).to.equal('xyz123')
    expect(playbook.content.branches).to.eql(['v*'])
    expect(playbook.content.editUrl).to.equal('{web_url}/blob/{refname}/{path}')
    expect(playbook.content.sources).to.have.lengthOf(1)
    expect(playbook.content.sources[0]).to.eql({
      url: 'https://gitlab.com/antora/demo/demo-component-a.git',
      branches: ['main', 'v*'],
    })
    expect(playbook.ui.bundle.url).to.equal('./../ui/build/ui-bundles.zip')
    expect(playbook.ui.bundle.startPath).to.equal('dark-theme')
    expect(playbook.ui.outputDir).to.equal('_')
    expect(playbook.ui.defaultLayout).to.equal('default')
    expect(playbook.ui.supplementalFiles).to.have.lengthOf(1)
    expect(playbook.ui.supplementalFiles[0]).to.eql({
      path: 'head-meta.hbs',
      contents: '<link rel="stylesheet" href="https://example.org/shared.css">',
    })
    expect(playbook.asciidoc.attributes).to.eql({
      'allow-uri-read': true,
      idprefix: '',
      toc: false,
      'uri-project': 'https://antora.org',
    })
    expect(playbook.asciidoc.extensions).to.eql(['asciidoctor-plantuml', './lib/shout-block'])
    expect(playbook.asciidoc.sourcemap).to.be.false()
    expect(playbook.git.credentials.path).to.equal('./.git-credentials')
    expect(playbook.git.ensureGitSuffix).to.be.true()
    expect(playbook.urls.htmlExtensionStyle).to.equal('indexify')
    expect(playbook.urls.redirectFacility).to.equal('nginx')
    expect(playbook.urls.latestVersionSegmentStrategy).to.equal('redirect:to')
    expect(playbook.urls.latestVersionSegment).to.equal('stable')
    expect(playbook.urls.latestPrereleaseVersionSegment).to.equal('unstable')
    expect(playbook.output.destinations).to.have.lengthOf(1)
    expect(playbook.output.dir).to.equal('./_site')
    expect(playbook.output.destinations[0].provider).to.equal('archive')
    expect(playbook.output.destinations[0].path).to.equal('./site.zip')
  })

  it('should allow site.url to be a pathname', () => {
    const playbook = buildPlaybook(['--playbook', defaultSchemaSpec, '--url', '/docs'], {})
    expect(playbook.site.url).to.equal('/docs')
  })

  it('should throw error if site.url is a relative path', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--url', 'docs'], {})).to.throw(
      'must be a valid URL or a pathname (i.e., root-relative path)'
    )
  })

  it('should throw error if site.url is a file URI', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--url', 'file:///path/to/docs'], {})).to.throw(
      'must be an HTTP or HTTPS URL or a pathname (i.e., root-relative path)'
    )
  })

  it('should throw error if site.url is an invalid URL', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--url', ':/foo'], {})).to.throw(
      'must be a valid URL or a pathname (i.e., root-relative path)'
    )
  })

  it('should throw error if site.url is not a string', () => {
    expect(() => buildPlaybook(['--playbook', invalidSiteUrlSpec], {})).to.throw('must be a string')
  })

  it('should throw error if site.url is a pathname containing spaces', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--url', '/my docs'], {})).to.throw(
      'pathname segment must not contain spaces'
    )
  })

  it('should throw error if site.url is an absolute URL containing spaces in the pathname', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--url', 'https://example.org/my docs'], {})).to.throw(
      'pathname segment must not contain spaces'
    )
  })

  it('should throw error if url is not a string', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec], { http_proxy: 5 })).to.throw('must be a string')
  })

  it('should throw error if url is a file URI', () => {
    expect(() => buildPlaybook(['--playbook', defaultSchemaSpec, '--http-proxy', 'file:///proxy'], {})).to.throw(
      'must be an HTTP or HTTPS URL'
    )
  })

  it('should throw error if boolean-or-string key is not a boolean or string', () => {
    Object.keys(schema).forEach((key) => {
      if (key !== 'playbook') delete schema[key]
    })
    schema.edit_url = {
      format: 'boolean-or-string',
      default: undefined,
    }
    expect(() => buildPlaybook([], { PLAYBOOK: invalidStringOrBooleanSpec }, schema)).to.throw(
      'must be a boolean or string'
    )
  })

  it('should not configure logger if runtime.log is not present in schema', () => {
    const previousRootLogger = getLogger(null)
    buildPlaybook([], { PLAYBOOK: yamlSpec }, schema)
    expect(previousRootLogger.closed).to.not.be.true()
  })

  it('should set quiet to true and log level to silent if runtime.silent is set', () => {
    const playbook = buildPlaybook(['--playbook', defaultSchemaSpec, '--silent', '--log-failure-level', 'none'])
    expect(getLogger(null).noop).to.be.true()
    expect(playbook.runtime.quiet).to.be.true()
    expect(playbook.runtime.log.level).to.equal('silent')
    expect(playbook.runtime.log.failureLevel).to.equal('none')
  })

  it('should set runtime.log.format to pretty when run locally', () => {
    const oldEnv = process.env
    const previousRootLogger = getLogger(null)
    try {
      process.env = Object.assign({}, oldEnv)
      delete process.env.CI
      delete process.env.NODE_ENV
      const playbook = buildPlaybook(['--playbook', defaultSchemaSpec])
      expect(previousRootLogger.closed).to.be.true()
      expect(getLogger(null).noop).to.be.false()
      expect(playbook.runtime.log.format).to.equal('pretty')
    } finally {
      process.env = oldEnv
    }
  })

  it('should override dynamic default value for log format', () => {
    const previousRootLogger = getLogger(null)
    const playbook = buildPlaybook(['--playbook', runtimeLogFormatSpec])
    expect(previousRootLogger.closed).to.be.true()
    expect(getLogger(null).noop).to.be.false()
    expect(playbook.runtime.log.format).to.equal('pretty')
  })

  it('should not accept playbook data that defines git.ensureGitSuffix', () => {
    expect(() => buildPlaybook(['--playbook', legacyGitEnsureGitSuffixSpec], {})).to.throw(/not declared in the schema/)
  })

  it('should not accept playbook data that defines runtime.pull', () => {
    expect(() => buildPlaybook(['--playbook', legacyRuntimePullSpec], {})).to.throw(/not declared in the schema/)
  })

  it('should not accept playbook data that defines ui.bundle as a String', () => {
    expect(() => buildPlaybook(['--playbook', legacyUiBundleSpec], {})).to.throw(/not declared in the schema/)
  })

  it('should not accept playbook data that defines ui.start_path', () => {
    expect(() => buildPlaybook(['--playbook', legacyUiStartPathSpec], {})).to.throw(/not declared in the schema/)
  })

  it('should throw if no configuration data is given', () => {
    expect(() => buildPlaybook()).to.throw()
  })

  it('should be decoupled from the process environment', () => {
    const oldEnv = process.env
    try {
      process.env = Object.assign({}, oldEnv, { URL: 'https://docs.example.org' })
      const playbook = buildPlaybook(['--ui-bundle-url', 'ui-bundle.zip'])
      expect(playbook.site.url).to.be.undefined()
    } finally {
      process.env = oldEnv
    }
  })

  it('should leave the process environment unchanged', () => {
    const processArgv = process.argv
    const processEnv = process.env
    const args = ['--one-one', 'the-args-value']
    const env = { PLAYBOOK: ymlSpec, ANTORA_TWO: 99 }
    const playbook = buildPlaybook(args, env, schema)
    expect(playbook.one.one).to.equal('the-args-value')
    expect(playbook.two).to.equal(99)
    expect(playbook.three).to.be.false()
    expect(process.argv).to.equal(processArgv)
    expect(process.env).to.equal(processEnv)
  })
})
