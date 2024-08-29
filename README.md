# FNet Block Proposers Service

Deployed at: https://fnet-analytics.d13.co/

API should be considered **unstable**.

## Getting Started

Install dependencies with `pnpm install`

Run the start script with the genesis ID as the argument:

`npm run start -- fnet-v1`

## Routes

### Status

[/v0/status](https://fnet-analytics.d13.co/v0/status)

```
{"ok":1,"maxRound":145286,"records":145286}
```

Sanity check: `maxRound` and `records` (record count) should match.

### Proposers' aggregate block count

[/v0/proposers](https://fnet-analytics.d13.co/v0/proposers)

Supports `?minRound=` and `?maxRound=` query parameters

Returns:

```
[
  {
    "proposer": "FNETJYY6YYB6SUWQDQZ5IDWLXOTOC2TMLW45B4O6MH5LREIBEXPREYSONY",
    "blocks": 22890,
    "payouts": 0
  },

  /* ... */

  {
    "proposer": "TFILLRA755KVNLXVTFZMKJS5KSQBSJCEUERCCHNTBWCPBNL54OO3WYZRZI",
    "blocks": 124,
    "payouts": 1240000000
  }
]
```

Array of records with:

- `proposer` for block proposer address
- `blocks` for total number of blocks proposed
- `payouts` for sum of payouts received

### Proposer blocks

[/v0/proposer/:address:](https://fnet-analytics.d13.co/v0/proposer/7OW3OE7WBNCV3VA5KGZZ6R2QTSXGG57ULV7466FF7ZUBUZFH5BW4JCAORA)

Supports `?minRound=` and `?maxRound=` query parameters

Returns:

```
[
  {
    "rnd": 55577,
    "pp": 10000000
  },
  {
    "rnd": 56546,
    "pp": 10000000
  },

  /* ... */

  {
    "rnd": 13
  },
```

Array of records with:

- `rnd`  for round of block proposed
- `pp` (optional) for payout amount 

## Environment Variables

| name             | description                                            | default_value           |
| ---------------- | ------------------------------------------------------ | ----------------------- |
| PORT             | HTTP server port                                       | 8118                    |
| ALGOD_TOKEN      | Algod token                                            |                         |
| ALGOD_HOST       | Algod host                                             | https://fnet-api.d13.co |
| ALGOD_PORT       | Algod port                                             | 443                     |
| CONCURRENCY      | Algod block request concurrency ( = 1 "chunk" below)   | 10                      |
| DB_CHUNKS        | Flush records to DB every n chunks                     | 100                     |
| SYNC_THRESHOLD   | Threshold of block difference to trigger parallel sync | 10                      |
| EMIT_SPEED_EVERY | Print speed to console every N processed chunks        | 4                       |

