import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";

type Memory = {
  state: State;
};

enum State {
  harvesting,
  upgrading,
  null
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "Upgrader" + Game.time.toString(),
    body: body,
    memory: {
      state: State.harvesting
    }
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

export const run = (creep: Creep, memory: Memory) => {
  switch (memory.state) {
    default:
    case State.harvesting:
      memory.state = harvest(creep);
      break;
    case State.upgrading:
      memory.state = upgrade(creep);
      break;
    case State.null:
      // do nothing
      break;
  }
};

const harvest = (creep: Creep): State => {
  const source = findSource(creep);
  if (source === null) {
    creep.say("No source!");
    return State.null;
  }

  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return State.upgrading;
  }

  return State.harvesting;
}

const upgrade = (creep: Creep): State => {
  const controller = creep.room.controller;
  if (controller === undefined) {
    creep.say("no controller!");
    return State.null;
  }
  const result = creep.upgradeController(controller);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(controller);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.upgrading;
}

const findSource = (creep: Creep): Source | null => {
  const sources = creep.room.find(FIND_SOURCES);
  return sources.length > 0
    ? sources[0]
    : null;
}
