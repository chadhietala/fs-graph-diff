Changes Input:

```
const APP = [
  ['create', 'my-app/src/main.js'],
  ['create', 'my-app/src/router.js'],
  ['create', 'my-app/src/ui/routes/index/route.js']
];

const MY_ADDON = [
  ['create', 'my-addon/src/utils/messaging.js'],
  ['create', 'my-addon/src/utils/strings.js'],
  ['create', 'my-addon/src/utils/object/mixin.js'],
  ['create', 'my-addon/src/utils/object/decorator.js'],
];
```

Module Information

```
const APP_MODULE_INFO = {
  "modules": [
    {
      "name": "my-app/src/ui/routes/index/route.js",
      "imports": [
        {
          "specifiers": [
            {
              "imported": "default",
              "kind": "named",
              "local": "Messaging"
            }
          ]
          "source": "my-addon/utils/messaging"
        }
      ],
      "exports": [
        {
          "specifier": {
            "kind": "default",
            "name": null
          }
        }
      ]
    },
    {
      "name": "my-app/src/router.js",
      "imports": [],
      "exports": [
        {
          "specifier": {
            "kind": "default",
            "name": null
          }
        }
      ]
    },
    {
      "name": "my-app/src/main.js",
      "imports": [
        {
          "specifiers": [
            {
              "imported": "STRING_1",
              "kind": "named",
              "local": "STRING_1"
            },
            {
              "imported": "STRING_2",
              "kind": "named",
              "local": "STRING_2"
            }
          ]
          "source": "my-addon/utils/strings"
        }
      ],
      "exports": [
        {
          "specifier": {
            "kind": "default",
            "name": null
          }
        }
      ]
    }
  ]
};

const MY_ADDON_MODULE_INFO = {
  "modules": [
    {
      "name": "my-addon/src/utils/messaging.js",
      "imports": [
        {
          "specifiers": [
            {
              "imported": "STRING_3",
              "kind": "named",
              "local": "STRING_3"
            }
          ]
          "source": "src/utils/strings"
        }
      ],
      "exports": [
        {
          "specifier": {
            "kind": "default",
            "name": null
          }
        }
      ]
    },
    {
      "name": "my-addon/src/utils/strings.js",
      "imports": [],
      "exports": [
        {
          "specifier": {
            "kind": "named",
            "name": "STRING_1"
          },
          "specifier": {
            "kind": "named",
            "name": "STRING_2"
          },
          "specifier": {
            "kind": "named",
            "name": "STRING_3"
          },
          "specifier": {
            "kind": "named",
            "name": "STRING_4"
          }
        }
      ]
    },
    {
      "name": "my-addon/src/utils/object/mixin.js",
      "imports": [],
      "exports": [
        {
          "specifier": {
            "kind": "default",
            "name": null
          }
        }
      ]
    },
    {
      "name": "my-addon/src/utils/object/decorators.js",
      "imports": [],
      "exports": [
        {
          "specifier": {
            "kind": "named",
            "name": "computed"
          },
          "specifier": {
            "kind": "named",
            "name": "or"
          }
        }
      ]
    }
  ]
}
```

Should output:

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js',
  'my-addon/src/utils/messaging.js',
  'my-addon/src/utils/strings.js'
];
```

Save a file that doesn't change imports:

```
const APP_CHANGES = [
  ['update', 'my-app/src/ui/routes/index/route.js']
]
```

Output

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js',
  'my-addon/src/utils/messaging.js',
  'my-addon/src/utils/strings.js'
];
```

Save a file that adds an import:

```
const APP_CHANGES = [
  ['update', 'my-app/src/ui/routes/index/route.js']
]
```

Output

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js',
  'my-addon/src/utils/messaging.js',
  'my-addon/src/utils/strings.js',
  'my-addon/src/utils/object/mixin.js'
];
```

Save a file that removes an import:

```
const APP_CHANGES = [
  ['update', 'my-app/src/ui/routes/index/route.js']
]
```

Output

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js',
  'my-addon/src/utils/messaging.js',
  'my-addon/src/utils/strings.js'
];
```

Save a file that removes an import but is retained elsewhere e.g. 'my-addon/src/utils/strings.js' will be retained because 'my-app/src/ui/routes/index/route.js' has 'my-addon/src/utils/messaging.js' which imports the strings:

```
const APP_CHANGES = [
  ['update', 'my-app/src/main.js']
]
```

Output

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js',
  'my-addon/src/utils/messaging.js',
  'my-addon/src/utils/strings.js'
];
```

Save a file that removes an import 'my-addon/src/utils/messaging.js' which imports the strings:

```
const APP_CHANGES = [
  ['update', 'my-app/src/ui/routes/index/route.js']
]
```

Output

```
const GRAPH = [
  'my-app/src/main.js',
  'my-app/src/router.js',
  'my-app/src/ui/routes/index/route.js'
];
```