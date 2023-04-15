import { BodyGenerator, SpawnConfig } from "./utils";

type SteveMemory = {
  state: SteveState;
} & CreepMemory

enum SteveState {
  harvesting,
  upgrading,
  transferring,
  null
}

export const spawnConfig = (): SpawnConfig => {
  return {
    name: "Steve",
    body: body,
    memory: {
      state: SteveState.harvesting
    }
  }
}

function* body(): BodyGenerator {
  let currentBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
  yield currentBody; // minimum

  while (true) {
    currentBody = currentBody.concat([MOVE]);
    yield currentBody;
    currentBody = currentBody.concat([WORK]);
    yield currentBody;
    currentBody = currentBody.concat([CARRY]);
    yield currentBody;
  }
}

export const run = (creep: Creep) => {
  const memory = creep.memory as SteveMemory;

  switch (memory.state) {
    default:
    case SteveState.harvesting:
      memory.state = harvest(creep);
      break;
    case SteveState.upgrading:
      memory.state = upgrade(creep);
      break;
    case SteveState.transferring:
      memory.state = transfer(creep);
      break;
    case SteveState.null:
      // do nothing
      break;
  }
};

const harvest = (creep: Creep): SteveState => {
  const source = getClosestSource(creep);
  if (source === null) {
    creep.say("😢Steve has no purpose");
    creep.suicide();
    return SteveState.null;
  }

  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return SteveState.upgrading;
  }

  return SteveState.harvesting;
}

const upgrade = (creep: Creep): SteveState => {
  const controller = creep.room.controller;
  if (controller === undefined) {
    creep.say("no controller!");
    return SteveState.transferring;
  }
  const result = creep.upgradeController(controller);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return SteveState.harvesting;
  }

  return SteveState.upgrading;
}

const transfer = (creep: Creep): SteveState => {
  const spawn = getClosestSpawn(creep);
  if (spawn === null) {
    creep.say("no spawn!");
    creep.drop(RESOURCE_ENERGY);
    return SteveState.upgrading;
  }
  const result = creep.transfer(spawn, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return SteveState.upgrading;
  }

  return SteveState.transferring;
}

const getClosestSource = (creep: Creep): Source | null => {
  const sources = creep.room.find(FIND_SOURCES);
  return sources.length > 0
    ? sources[0]
    : null;
}

const getClosestSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}
