import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";
import * as HeavyMiner from "./HeavyMiner";

type Memory = {
  state: State;
  containerPos?: Pos;
};

enum State {
  withdraw = "withdraw",
  harvesting = "harvesting",
  transferring = "transferring"
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "Upgrader" + Game.time.toString(),
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
      memory.state = withdraw(creep, memory);
      break;
    case State.harvesting:
      memory.state = harvest(creep);
      break;
    case State.transferring:
      memory.state = upgrade(creep);
      break;
  }
};

const withdraw = (creep: Creep, memory: Memory): State => {
  let container: StructureContainer | undefined;
  if (memory.containerPos) {
    container = creep.room.lookForAt(LOOK_STRUCTURES, memory.containerPos.x, memory.containerPos.y)
    .filter(s => s.structureType === "container")
    .map(s => s as StructureContainer)[0];
  }

  if (!container) {
    container = creep.room.find(FIND_STRUCTURES)
    .filter(s => s.structureType === "container")
    .map(s => s as StructureContainer)
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
    return State.transferring;
  }

  return State.withdraw;
}

const harvest = (creep: Creep): State => {
  const loc = HeavyMiner.availableMiningLocation(creep.room);
  const source = loc ? creep.room.lookForAt(LOOK_SOURCES, loc.sourcePos.x, loc.sourcePos.y)[0] : null;
  if (!source) {
    return State.harvesting;
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

const upgrade = (creep: Creep): State => {
  const controller = creep.room.controller;
  if (controller === undefined) {
    creep.say("no controller!");
    return State.harvesting;
  }

  if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(controller);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.withdraw;
  }

  return State.transferring;
}
