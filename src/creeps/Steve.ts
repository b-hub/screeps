import { CreepBodyGenerator, CreepSpawnConfig } from "./roles/utils";
import { Roles, Role } from "./roles";
import { Position } from "source-map";

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
  if (!spawn || spawn.memory.nextRole) {
    return null;
  }

  const creeps = creep.room.find(FIND_MY_CREEPS);
  const spawnSupplierRole: Role = "SpawnSupplier";
  if (creeps.filter(c => c.memory.role === spawnSupplierRole).length < 2) {
    spawn.memory.nextRole = spawnSupplierRole;
    return spawnSupplierRole;
  }

  const minerRole: Role = "HeavyMiner";
  const containerPos = getContainerPosition(creep.room);
  if (containerPos && containerPos.lookFor(LOOK_CONSTRUCTION_SITES).length === 0 && containerPos.lookFor(LOOK_STRUCTURES).length === 0) {
    console.log("Created container construction site");
    creep.say("🚧");
    creep.room.createConstructionSite(containerPos, STRUCTURE_CONTAINER);
    return minerRole;
  }

  if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
    if (creeps.filter(c => c.memory.role === minerRole).length < 1) {
      spawn.memory.nextRole = minerRole;
    }

    return minerRole;
  }

  return null;
}

const findSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}

const hasBuiltContainer = (room: Room): boolean => {
  const containers = room.find(FIND_MY_CONSTRUCTION_SITES).filter(c => c.structureType === STRUCTURE_CONTAINER);
  return containers.length > 0;
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
