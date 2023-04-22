import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";
import * as HeavyMiner from "./HeavyMiner";

type Memory = {
  state: State;
  containerPos?: Pos;
};

enum State {
  building,
  harvesting,
  withdrawing
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "Builder" + Game.time.toString(),
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
    currentBody = currentBody.concat([MOVE, CARRY]);
    yield currentBody;
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
    case State.withdrawing:
      memory.state = withdraw(creep, memory);
      break;
  }
};

const withdraw = (creep: Creep, memory: Memory): State => {
  let container: StructureContainer | undefined;
  if (memory.containerPos) {
    container = creep.room.lookForAt(LOOK_STRUCTURES, memory.containerPos.x, memory.containerPos.y)
    .filter(s => s.structureType === "container")
    .map(s => s as StructureContainer)
    .filter(s => s.store.getUsedCapacity("energy") > 0)[0];
  }

  if (!container) {
    container = creep.room.find(FIND_STRUCTURES)
    .filter(s => s.structureType === "container")
    .map(s => s as StructureContainer)
    .filter(s => s.store.getUsedCapacity("energy") > 0)
    .sort((a, b) => a.store.getFreeCapacity() - b.store.getFreeCapacity())[0];
  }

  if (!container) {
    return State.harvesting;
  }

  memory.containerPos = container.pos;
  const result = creep.withdraw(container, "energy");
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    memory.containerPos = undefined;
    return State.building;
  }

  return State.withdrawing;
}

const harvest = (creep: Creep): State => {
  const loc = HeavyMiner.availableMiningLocation(creep.room);
  const source = loc ? creep.room.lookForAt(LOOK_SOURCES, loc.sourcePos.x, loc.sourcePos.y)[0] : null;
  if (!source) {
    return State.withdrawing;
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
    return State.harvesting;
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
