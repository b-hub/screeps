import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";

type Memory = {
  state: State;
};

enum State {
  building,
  harvesting,
  null
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "HBuilder" + Game.time.toString(),
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
    currentBody = currentBody.concat([WORK]);
    yield currentBody;
  }
}

export const run = (creep: Creep, memory: Memory) => {
  switch (memory.state) {
    default:
    case State.harvesting:
      memory.state = harvest(creep);
      break;
    case State.building:
      memory.state = build(creep);
      break;
    case State.null:
      // do nothing
      break;
  }
};

const harvest = (creep: Creep): State => {
  const source = findSource(creep);
  if (source === null) {
    return State.null;
  }

  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(source);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return State.building;
  }

  return State.harvesting;
}

const build = (creep: Creep): State => {
  const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
  if (sites.length === 0) {
    return State.null;
  }

  const site = sites[0];
  const result = creep.build(site)

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(site);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.building;
}

const findSource = (creep: Creep): Source | null => {
  const sources = creep.room.find(FIND_SOURCES);
  return sources.length > 0
    ? sources[0]
    : null;
}
