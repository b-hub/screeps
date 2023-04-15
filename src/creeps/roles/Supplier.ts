import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";
import * as HeavyMiner from "./HeavyMiner";

type Memory = {
  state: State;
};

enum State {
  withdraw = "withdraw",
  harvesting = "harvesting",
  transferring = "transferring",
  null = "null"
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "Supplier" + Game.time.toString(),
    body: body,
    memory: {
      state: State.withdraw
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
    case State.withdraw:
      memory.state = withdraw(creep);
      break;
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

const withdraw = (creep: Creep): State => {
  const container = creep.room.find(FIND_STRUCTURES).find(s => s.structureType === "container");
  if (!container) {
    return State.harvesting;
  }

  const result = creep.withdraw(container, "energy");
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return State.transferring;
  }

  return State.withdraw;
}

const harvest = (creep: Creep): State => {
  const loc = HeavyMiner.availableMiningLocation(creep.room);
  const source = loc ? creep.room.lookForAt(LOOK_SOURCES, loc.sourcePos.x, loc.sourcePos.y)[0] : null;
  if (!source) {
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
  const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
  if (spawn === null) {
    return State.null;
  }
  const result = creep.transfer(spawn, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.withdraw;
  }

  return State.transferring;
}
