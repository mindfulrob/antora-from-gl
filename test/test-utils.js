'use strict'

// IMPORTANT nodegit must be loaded before asciidoctor.js or else promisify gets tripped up by Opal enhancements
require('nodegit')

const chai = require('chai')
const expect = chai.expect

const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const spies = require('chai-spies-next')
chai.use(spies)

// this must be loaded after the other plugins
// https://github.com/prodatakey/dirty-chai#plugin-assertions
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

module.exports = { expect, spy: chai.spy }
