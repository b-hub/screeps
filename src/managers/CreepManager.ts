import { Roles, isRole, Role } from "../creeps/roles";
import * as Witness from "creeps/tempRoles/Witness";
import { isAlive, isSpawning, creepAge } from "../creeps/utils";

export const run = () => {
  for (const name in Game.creeps) {
    runCreep(Game.creeps[name]);
  }
}


const runCreep = (creep: Creep) => {
  let role: Role = creep.memory.role as Role;
  if (!isRole(role)) {
    return;
  }

  // const steve = Game.creeps.Steve;
  // if (isSpawning(steve) ||
  //     !isAlive(steve) && role !== "Supplier" ||
  //     isAlive(steve) && creepAge(steve) < 5) {
  //   return witnessTheBirthOfSteve(creep);
  // }

  creep.memory.tmp = undefined;
  return Roles[role].run(creep, creep.memory.current);
};

const witnessTheBirthOfSteve = (creep: Creep) => {
  creep.memory.tmp = creep.memory.tmp ?? {};
  return Witness.run(creep, creep.memory.tmp);
}

