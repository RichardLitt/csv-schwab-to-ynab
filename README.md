# ynab-convert-csv

> A converter for Banking transaction CSV files to YNAB format

This tool lets you transform csvs from various banks into a format expected by YNAB. Currently accepted Schwab and TDBank only.

## Install

    npm install -g ynab-convert-csv

## Usage

    ynab-convert-csv --input=examples/schwab.csv --output=schwab_CONVERTED.csv [--map=map.json] --bank=schwab

## Mapping files

If you supply a mapping file, we'll try to map transactions to payees and categories. This matching is pretty simple, keys in a JSON file are matched with transaction descriptions with a "starts with" check. So, for example, a transaction with a description of `VDP-PAYPAL` will match transactions that start with this (e.g. `VDP-PAYPAL *SPOTIF` would match). Beneath these keys is an object with two keys: `payee` & `category`, which you can use to specify your payees and categories. Payees and categories here work the same way they do in YNAB, so transfers, for example, will have the same rules as YNAB for whether they need a category or not.

Examples speak louder than words, here's a sample `map.json`:

    {
      "VDP-Amazon *Mktplc": {
        "payee": "Amazon Marketplace",
        "category": "Everyday Expenses: Amazon"
      },
      "VDA-": {
        "payee": "Transfer: Cash",
        "category": ""
      },
      "D/D BORD GAIS EIRE": {
        "payee": "Bord Gais",
        "category": "Monthly Bills: Gas and Electricity"
      }
    }

If a map isn't found, the transformer falls back to using the description for both `payee` and `category`.

## For Schwab

For schwab, there's an extra line at the beginning of the file that currently needs to be manually deleted. Work is ongoing on the `feat/strip-schwab-lines` branch.

## Contribute

Please do! I basically used the code from [this module for AIB](https://github.com/jasonmadigan/aib-to-ynab) by [@jasonmadigan](https://github.com/jasonmadigan), to whom I am very grateful. Happy to edit this or pass it along to others who are interested. Open an issue.

## License

MIT