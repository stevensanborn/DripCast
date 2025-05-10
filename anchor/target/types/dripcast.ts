/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dripcast.json`.
 */

export type Dripcast = {
  "address": "7mHNUhhpqGZWMyEwCEP1eGMktSDz2qYfU1UtFQo7ZBRc",
  "metadata": {
    "name": "dripcast",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor for DripCast!"
  },
  "instructions": [
    {
      "name": "closeCreator",
      "discriminator": [
        162,
        202,
        231,
        110,
        245,
        197,
        79,
        25
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeMonetization",
      "discriminator": [
        227,
        202,
        78,
        85,
        24,
        175,
        107,
        230
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetization",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "monetization.monetization_id",
                "account": "monetization"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeMonetizationState",
      "discriminator": [
        239,
        76,
        162,
        165,
        17,
        0,
        196,
        14
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetizationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "monetization_state.monetization",
                "account": "monetizationState"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeCreator",
      "discriminator": [
        29,
        153,
        44,
        99,
        52,
        172,
        81,
        115
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userId",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeDripcast",
      "discriminator": [
        215,
        111,
        35,
        211,
        74,
        70,
        195,
        19
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dripcast",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  114,
                  105,
                  112,
                  99,
                  97,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeMonetization",
      "discriminator": [
        20,
        79,
        171,
        17,
        78,
        133,
        249,
        16
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetization",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "monetizationId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "monetizationId",
          "type": "string"
        },
        {
          "name": "monetizationType",
          "type": "string"
        },
        {
          "name": "cost",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "f32"
        },
        {
          "name": "endTime",
          "type": "f32"
        }
      ]
    },
    {
      "name": "initializeMonetizationState",
      "discriminator": [
        241,
        54,
        135,
        11,
        47,
        215,
        15,
        37
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetizationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "monetization"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "monetization",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "transferMonetizationState",
      "discriminator": [
        81,
        36,
        36,
        151,
        57,
        191,
        255,
        204
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetizationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "monetization_state.monetization",
                "account": "monetizationState"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator.owner",
                "account": "creator"
              }
            ]
          }
        },
        {
          "name": "dripcast",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  114,
                  105,
                  112,
                  99,
                  97,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMonetization",
      "discriminator": [
        193,
        148,
        141,
        86,
        33,
        59,
        216,
        225
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetization",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "monetization.monetization_id",
                "account": "monetization"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "duration",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "startTime",
          "type": {
            "option": "f32"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "f32"
          }
        },
        {
          "name": "monetizationType",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "updateMonetizationState",
      "discriminator": [
        184,
        190,
        8,
        183,
        154,
        177,
        121,
        115
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "monetizationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  110,
                  101,
                  116,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "monetization_state.monetization",
                "account": "monetizationState"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawlCreator",
      "discriminator": [
        238,
        3,
        215,
        136,
        164,
        177,
        144,
        151
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator.owner",
                "account": "creator"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawlDripcast",
      "discriminator": [
        237,
        87,
        185,
        155,
        85,
        242,
        85,
        50
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dripcast",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  114,
                  105,
                  112,
                  99,
                  97,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creator",
      "discriminator": [
        237,
        37,
        233,
        153,
        165,
        132,
        54,
        103
      ]
    },
    {
      "name": "dripcast",
      "discriminator": [
        176,
        243,
        249,
        45,
        170,
        163,
        137,
        252
      ]
    },
    {
      "name": "monetization",
      "discriminator": [
        47,
        228,
        231,
        251,
        114,
        122,
        195,
        216
      ]
    },
    {
      "name": "monetizationState",
      "discriminator": [
        200,
        20,
        60,
        67,
        225,
        14,
        25,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "monetizationIdTooLong",
      "msg": "Content ID must be 36 characters or less"
    },
    {
      "code": 6001,
      "name": "monetizationTypeTooLong",
      "msg": "Monetization type must be 32 characters or less"
    },
    {
      "code": 6002,
      "name": "invalidTimeRange",
      "msg": "Invalid time range: end time must be greater than start time and start time must be non-negative"
    },
    {
      "code": 6003,
      "name": "userIdTooLong",
      "msg": "User ID must be 36 characters or less"
    },
    {
      "code": 6004,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    }
  ],
  "types": [
    {
      "name": "creator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userId",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "dripcast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dripcastName",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "monetization",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "monetizationId",
            "type": "string"
          },
          {
            "name": "monetizationType",
            "type": "string"
          },
          {
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "duration",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "f32"
          },
          {
            "name": "endTime",
            "type": "f32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "monetizationState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "monetization",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "minTransactionFee",
      "type": "u64",
      "value": "75000"
    }
  ]
};
