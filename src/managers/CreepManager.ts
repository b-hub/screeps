import { RunnerCreep } from "creeps/RunnerCreep";
import { CreepRole } from "enums/CreepRole";

export class CreepManager {

    public static run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            CreepManager.runCreep(creep);
        }
    }

    private static runCreep(creep: Creep) {
        var creepRole = creep.memory.role;

        switch (creepRole) {
            case CreepRole.runner:
                RunnerCreep.run(creep);
                break;
            default:
                console.log(`unknown creep role '${creepRole}'`);
                break;
        }
    }
}
