import { CreepBodyGenerator, CreepSpawnConfig } from "./roles/utils";
import { Roles, Role } from "./roles";

type Memory = {
  role: Role;
  current: any;
};

export const spawnConfig = (): CreepSpawnConfig => {
  const memory: Memory = {
    role: "SpawnSupplier", // get other creeps spawning faster
    current: {}
  };

  return {
    name: "Steve", // there can only be one
    body: body,
    memory: memory
  }
}

function* body(): CreepBodyGenerator {
  let currentBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
  yield currentBody; // minimum

  while (true) {
    // ensures that we always have enough movement for [WORK,CARRY]
    currentBody = currentBody.concat([MOVE]);
    yield currentBody;
    currentBody = currentBody.concat([WORK]);
    yield currentBody;
    currentBody = currentBody.concat([CARRY]);
    yield currentBody;
  }
}

export const run = () => {
  const creep = Game.creeps.Steve;
  if (!creep) {
    return;
  }

  const nextRole: Role = "SpawnSupplier";
  const spawn = findSpawn(creep);
  if (spawn) {
    spawn.memory.nextRole = nextRole;
  }

  const memory = creep.memory.current as Memory;
  Roles[memory.role].run(creep, memory.current);
};

const findSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}
