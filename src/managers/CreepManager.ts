import { Steve } from "creeps/Steve";
import { CreepRole } from "enums/CreepRole";

export class CreepManager {
  public static run() {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      CreepManager.runCreep(creep);
    }
  }

  private static runCreep(creep: Creep) {
    const creepRole = creep.memory.role;

    switch (creepRole) {
      case CreepRole.steve:
        Steve.run(creep);
        break;
      default:
        console.log(`unknown creep role '${creepRole}'`);
        break;
    }
  }
}
