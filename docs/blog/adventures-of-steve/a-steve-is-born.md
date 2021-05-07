---
description: 25/04/2021 - From initial project setup to the first Steve being born
---

# A Steve is Born

## Initial setup

A very simple main.ts

{% code title="main.ts" %}
```typescript
//import { ErrorMapper } from "utils/ErrorMapper";
import { gameLoop } from "loop";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
//export const loop = ErrorMapper.wrapLoop(gameLoop);

export const loop = gameLoop;
```
{% endcode %}

The main loop code was moved to the 'loop.ts' file which holds the code responsible for handling each loop step. The main.ts then can optionally use the ErrorMapper or not.

{% code title="loop.ts" %}
```typescript
import { CreepManager } from "managers/CreepManager";
import { SpawnManager } from "managers/SpawnManager";
import { cleanMemory } from "utils/GameUtils";

export const gameLoop = () => {
  console.log(`Current game tick is ${Game.time}`);
  cleanMemory();

  SpawnManager.run();
  CreepManager.run();
};

```
{% endcode %}

### SpawnManager

The loop.ts module is responsible for calling the higher-level functions, like deleting creeps from memory that no longer exist and running the managers.

{% code title="SpawnMananger.ts" %}
```typescript
import { CreepRole } from "enums/CreepRole";

export class SpawnManager {

    public static run() {
        for (var name in Game.spawns) {
            var spawn = Game.spawns[name];
            SpawnManager.runSpawn(spawn);
        }
    }

    private static runSpawn(spawn: StructureSpawn) {
        var result = spawn.spawnCreep([WORK, MOVE, CARRY], "Steve", {
            dryRun: true
        });

        if (result === OK) {
            spawn.spawnCreep([WORK, MOVE, CARRY], "Steve", {
                dryRun: false,
                memory: {
                    role: CreepRole.steve,
                    room: "",
                    working: false
                }
            });
        }
    }

}

```
{% endcode %}

The SpawnManager is responsible for creating new creeps. This initial code only allows for one creep to exist at a time, called Steve. Steve is hard-coded to have a role of 'steve', but this will change in the future to be more dynamic.

![A Steve is Born](../../.gitbook/assets/a-steve-is-born.gif)

The above GIF shows the code running in a training room. 



