import { BodyGenerator, SpawnConfig } from "./utils";

type Memory = {
  state: State;
};

enum State {
  harvesting,
  transferring,
  null
}

export const spawnConfig = (): SpawnConfig => {
  return {
    name: "SpawnEnergiser" + Game.time.toString(),
    body: body,
    memory: {
      state: State.harvesting
    }
  }
}

function* body(): BodyGenerator {
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

export const run = (creep: Creep, memory: Memory) => {
  switch (memory.state) {
    default:
    case State.harvesting:
      memory.state = harvest(creep);
      break;
    case State.transferring:
      memory.state = transfer(creep);
      break;
    case State.null:
      // do nothing
      break;
  }
};

const harvest = (creep: Creep): State => {
  const source = findSource(creep);
  if (source === null) {
    creep.say("😢No purpose");
    creep.suicide();
    return State.null;
  }

  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return State.transferring;
  }

  return State.harvesting;
}

const transfer = (creep: Creep): State => {
  const spawn = findSpawn(creep);
  if (spawn === null) {
    creep.say("😢No purpose");
    creep.suicide();
    return State.null;
  }
  const result = creep.transfer(spawn, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.transferring;
}

const findSource = (creep: Creep): Source | null => {
  const sources = creep.room.find(FIND_SOURCES);
  return sources.length > 0
    ? sources[0]
    : null;
}

const findSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}
