# FNet Block Proposers Service

Deployed at: https://fnet-analytics.d13.co/

## Routes

### Status

[/v0/status](https://fnet-analytics.d13.co/v0/status)

```
{"ok":1,"maxRound":145286,"records":145286}
```

Sanity check: `maxRound` and `records` (record count) should match.

### Proposers' aggregate block proposal count

[/v0/proposers](https://fnet-analytics.d13.co/v0/proposers)

Returns:

```
[
  {
    "proposer": "FNETJYY6YYB6SUWQDQZ5IDWLXOTOC2TMLW45B4O6MH5LREIBEXPREYSONY",
    "blocks": 16832
  },
  {
    "proposer": "FNETNDMRNC3GJBLZ4MM2FXL3OYA5W6ULTICOWACLYHDP4EAJWNBXSIMILE",
    "blocks": 16624
  },
  {
    "proposer": "FNET57EE5J4N7RVW3SCNGSL6SHCUENKO2GMMJCX3MMQRJKM77THEMEBANE",
    "blocks": 16612
  },
  /* ... */
]

```

Array of records containing `proposer` (address) and `blocks` (count)

Supports `?minRound=` and `?maxRound=` query parameters

### Proposer blocks

[/v0/proposer/:address:](https://fnet-analytics.d13.co/v0/proposer/FNETJYY6YYB6SUWQDQZ5IDWLXOTOC2TMLW45B4O6MH5LREIBEXPREYSONY)

Returns:

```
[1,16,43,68,87,88,89,91,105,106,109,113,139,141,172,178,181 /* ... */]
```

Array of numbers: block proposed by  `address`

Supports `?minRound=` and `?maxRound=` query parameters
