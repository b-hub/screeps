import * as Steve from "creeps/Steve";
import { CreepRole } from "enums/CreepRole";

export const run = () => {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    runCreep(creep);
  }
}

const runCreep = (creep: Creep) => {
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
