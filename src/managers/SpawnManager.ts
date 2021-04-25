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
                    role: CreepRole.runner,
                    room: "",
                    working: false
                }
            });
        }
    }

}
