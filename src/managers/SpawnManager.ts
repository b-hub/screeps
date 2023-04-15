import { CreepRole } from "enums/CreepRole";
import * as Steve from "creeps/Steve";

export const run = () => {
  for (const name in Game.spawns) {
    const spawn = Game.spawns[name];
    runSpawn(spawn);
  }
};

const runSpawn = (spawn: StructureSpawn) => {
  const result = spawn.spawnCreep(Steve.body(), "Steve", {
    dryRun: true
  });

  if (result === OK) {
    spawn.spawnCreep(Steve.body(), "Steve", {
      dryRun: false,
      memory: Steve.memory({
        role: CreepRole.steve
      })
    });
  }
}
