# FNet Block Proposers Service

Deployed at: https://fnet-analytics.d13.co/

## Routes

### Status

[/v0/status](https://fnet-analytics.d13.co/v0/status)

```
{"ok":1,"maxRound":145286,"records":145286}
```

sanity check: maxRound and records (record count) should match

### Proposers

[/v0/proposers](https://fnet-analytics.d13.co/v0/proposers)

Returns:

```
[{"proposer":"FNETJYY6YYB6SUWQDQZ5IDWLXOTOC2TMLW45B4O6MH5LREIBEXPREYSONY","blocks":16832},{"proposer":"FNETNDMRNC3GJBLZ4MM2FXL3OYA5W6ULTICOWACLYHDP4EAJWNBXSIMILE","blocks":16624},{"proposer":"FNET57EE5J4N7RVW3SCNGSL6SHCUENKO2GMMJCX3MMQRJKM77THEMEBANE","blocks":16612},{"proposer":"FNET43EQJGPZNQPDWZSWEPAGTVFBA5WKUB64BPWWWLD4MCJUCMQDSONATA","blocks":16583},{"proposer":"FNET3652NR5TZPIKDM2K5I6RJYQ3VPVYJDMY4BCYWK5EHDOFZUWSNOZZLE","blocks":16575},{"proposer":"FNETXNAQWEQNSGCURWYEDBSRI2OE5AC2CDU2GBPYIB6CZ44PSYMCOUNTRY","blocks":16535},{"proposer":"FNET67F5XSKPMI5QGZOM2VJPJA4RCE36B7ZO6FZVEKLVG4PUCVBESTSLAY","blocks":16525},{"proposer":"FNETYCFSVZBPFBZN4YXCMIH2BCOKD42ROFWEFXQSTNU73VAKRSDINOHIKE","blocks":16513},{"proposer":"FNETC46DGTSSDHA6C54FWEGZ3Z5ADE4YAPYQTX5VEE2YGU5NFPAWTRANCE","blocks":4175},{"proposer":"FNETYTHKXMDRMVFLBHY3LPKQQ6UO4PU2ARZ5N76EGF7NTLE6I7I234MAUI","blocks":4075},{"proposer":"KKCVBOALNJU6Y6DF6WJWIXLCQSKDMOX6AQSC36CLJ7YDBJA3D4D3W5KS3U","blocks":3364},{"proposer":"7OW3OE7WBNCV3VA5KGZZ6R2QTSXGG57ULV7466FF7ZUBUZFH5BW4JCAORA","blocks":678},{"proposer":"356WD64TIHGE3KJT5XQPFIJ7BMUDECQS3MHK5NMGP6CEBTNBK6R74TIKNM","blocks":124},{"proposer":"TFILLRA755KVNLXVTFZMKJS5KSQBSJCEUERCCHNTBWCPBNL54OO3WYZRZI","blocks":74}]
```

Array of records containing `proposer` (address) and `blocks` (count)

Supports `?minRound=` and `?maxRound=` query parameters

### Proposer blocks

[/v0/proposer/:address:](https://fnet-analytics.d13.co/v0/proposer/FNETJYY6YYB6SUWQDQZ5IDWLXOTOC2TMLW45B4O6MH5LREIBEXPREYSONY)

Returns:

```
[1,16,43,68,87,88,89,91,105,106,109,113,139,141,172,178,181 /* ... */]
```

Array of block numbers proposed by  `address`

Supports `?minRound=` and `?maxRound=` query parameters
