# FS Graph Diff

### Example
```
let graph = new FSGraph('my-app');
let retainedGraph = graph.calculateGraph(
  ['create', 'my-app/router.js'],
  ['create', 'my-app/main.js'],
  ['create', 'my-app/ui/components/foo-bar/component.js'],
  ['create', 'my-addon/ui/components/baz-bar/component.js'],
  ['create', 'my-addon/utils/strings.js'],
  ['create', 'my-addon/utils/messaging.js'],
  {
    "my-app": {
      files: [
        {
          name: 'my-app/router.js',
          imports: [
            {
              source: 'my-addon/utils/messaging',
              specifiers: [
                {
                  imported: 'default',
                  kind: 'name',
                  local: 'Messaging'
                }
              ]
            }
          ]
        },
        {
          name: 'my-app/main.js',
          imports: []
        },
        {
          name: 'my-app/ui/components/foo-bar/component.js',
          imports: []
        }
      ]
    },
    "my-addon":     {
      files: [
        {
          name: 'my-addon/utils/messaging.js',
          imports: []
        },
        {
          name: 'my-addon/utils/strings.js',
          imports: []
        },
        {
          name: 'my-addon/ui/components/baz-bar/component.js',
          imports: [
            {
              source: 'my-addon/utils/messaging',
              specifiers: [
                {
                  imported: 'default',
                  kind: 'name',
                  local: 'Messaging'
                }
              ]
            }
          ]
        }
      ]
    }
  }
);

console.log(retainedGraph)
/*
[
  'my-app/router.js',
  'my-app/main.js',
  'my-addon/utils/messaging.js'
]
*/
```
