#!/usr/bin/env node

var csv = require('fast-csv')
var fs = require('fs')
var _ = require('lodash')

var argv = require('yargs')
  .usage('Usage: ynab-convert-csv--input=Transaction_Export.csv --output=Transaction_Export_CONVERTED.csv [--map=map.json]')
  .demand(['input'])
  .describe('output', `Optional output file - if not specified, will output as ${['input']}_CONVERTED.csv`)
  .describe('map', 'Optional Payee and Category mapping file')
  .describe('bank', 'Bank to parse from: schwab or td.')
  .argv

var map = (argv.map) ? JSON.parse(fs.readFileSync(argv.map, 'utf8')) : null

if (!argv.output) {
  argv.output = `${argv.input.split('.')[0]}_CONVERTED.csv`
}

if (map) {
  console.log('Using map file.')
}

function _match (description) {
  var key = _.findKey(map, function (value, key) {
    return _.startsWith(description, key)
  })

  if (!key) {
    console.log('No Match', description)
    return null
  }

  return map[key]
}

function mapCategory (description) {
  if (!map) return

  var match = _match(description)
  if (!match) return description

  return match.category
}

function mapPayee (description) {
  if (!map) return description

  var match = _match(description)
  if (!match) return description

  return match.payee
}

// TODO Remove first line and 'posted transactions lines' from schwab
// TODO Add General Expenses mapping if ATM is in memo

if (argv.bank === 'schwab') {
  csv
    .fromPath(argv.input, {
      headers: true,
      trim: true
    })
    .transform((obj) => {
      return {
        'Date': obj['Date'],
        'Payee': mapPayee(obj.Description),
        'Category': mapCategory(obj.Description),
        'Memo': obj['Type'],
        'Outflow': obj['Withdrawal (-)'],
        'Inflow': obj['Deposit (+)']
      }
    })
    .pipe(csv.createWriteStream({
      headers: true
    }))
    .pipe(fs.createWriteStream(argv.output, {
      encoding: 'utf8'
    })
  )
} else if (argv.bank === 'td') {
  csv
    .fromPath(argv.input, {
      headers: false,
      trim: true
    })
    .transform((obj) => {
      return {
        'Date': obj[0],
        'Payee': mapPayee(obj[4]),
        'Category': mapCategory(obj[4]),
        'Memo': null,
        'Outflow': obj[5],
        'Inflow': obj[6]
      }
    })
    .pipe(csv.createWriteStream({
      headers: true
    }))
    .pipe(fs.createWriteStream(argv.output, {
      encoding: 'utf8'
    })
  )
} else {
  console.log('Please specify --bank as `td` or `schwab`')
}
