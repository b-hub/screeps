import { Roles, isRole } from "../creeps/roles";
import * as WitnessSteve from "creeps/roles/witnessSteve";
import { isAlive, isSpawning, creepAge } from "../creeps/utils";

export const run = () => {
  for (const name in Game.creeps) {
    runCreep(Game.creeps[name]);
  }
}


const runCreep = (creep: Creep) => {
  const role = creep.memory.role;
  if (!isRole(role)) {
    return;
  }

  const steve = Game.creeps.Steve;
  if (isSpawning(steve) ||
      !isAlive(steve) && role !== "SpawnSupplier" ||
      isAlive(steve) && creepAge(steve) < 5) {
    return witnessTheBirthOfSteve(creep);
  }

  creep.memory.tmp = undefined;
  return Roles[role].run(creep, creep.memory.current);
};

const witnessTheBirthOfSteve = (creep: Creep) => {
  creep.memory.tmp = creep.memory.tmp ?? {};
  return WitnessSteve.run(creep, creep.memory.tmp);
}

