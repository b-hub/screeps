import { CreepRole } from "enums/CreepRole";

export class SpawnManager {
  public static run() {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      SpawnManager.runSpawn(spawn);
    }
  }

  private static runSpawn(spawn: StructureSpawn) {
    const result = spawn.spawnCreep([WORK, MOVE, CARRY], "Steve", {
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
