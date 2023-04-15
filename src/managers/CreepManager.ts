import { Roles, isRole } from "../creeps/roles";

export const run = () => {
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    runCreep(creep);
  }
}


const runCreep = (creep: Creep) => {
  const role = creep.memory.role;
  if (isRole(role)) {
    console.log(role, "is role");
    return Roles[role].run(creep, creep.memory.current);
  }
};

