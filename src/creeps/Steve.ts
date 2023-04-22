import { CreepBodyGenerator, CreepSpawnConfig } from "./roles/utils";
import { Roles, Role } from "./roles";
import * as HeavyMiner from "./roles/HeavyMiner";
import * as Runner from "./roles/Runner";

type Memory = {
  role: Role;
  current: any;
};

export const spawnConfig = (): CreepSpawnConfig => {
  const memory: Memory = {
    role: "Supplier", // get other creeps spawning faster
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

  const memory = creep.memory.current as Memory;
  const role = setNextRoleToSpawn(creep) ?? memory.role;

  if (memory.role !== role) {
    memory.current = {};
    memory.role = role;
  }

  Roles[role].run(creep, memory.current);
};

const setNextRoleToSpawn = (creep: Creep): Role | null => {
  const spawn = findSpawn(creep);
  let role = null;
  if (!spawn) {
    return role;
  }

  const creeps = creep.room.find(FIND_MY_CREEPS);
  const spawnSupplierRole: Role = "Supplier";
  if (creeps.filter(c => c.memory.role === spawnSupplierRole).length < 1) {
    spawn.memory.nextRole = spawnSupplierRole;
    return spawnSupplierRole;
  }

  const minerRole: Role = "HeavyMiner";
  const availableLocs = HeavyMiner.availableMiningLocations(creep.room).length;
  if (availableLocs > 0) {
    spawn.memory.nextRole = minerRole;
    return role;
  }

  const builderRole: Role = "Builder";
  if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 && creeps.filter(c => c.memory.role === builderRole).length < 1) {
    spawn.memory.nextRole = builderRole;
    return builderRole;
  }

  const runnerRole: Role = "Runner";
  if (Runner.canSpawn(creep.room) && Runner.getAvailableRunLocations(creep).length > 0) {
    spawn.memory.nextRole = runnerRole;
    return role;
  }

  const upgraderRole: Role = "Upgrader";
  spawn.memory.nextRole = upgraderRole;

  return upgraderRole;
}

const findSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}

const getContainerPosition = (room: Room): RoomPosition | null => {
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  const source = spawn.pos.findClosestByPath(FIND_SOURCES);
  if (!source) {
    return null;
  }

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const pos = room.getPositionAt(source.pos.x + i, source.pos.y + j);
      if (pos && room.getTerrain().get(pos.x, pos.y) === 0) {
        return pos;
      }
    }
  }

  return null;
}
