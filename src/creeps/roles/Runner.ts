import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";

type Memory = {
  state: State;
  post?: RunLocation;
};

enum State {
  withdrawing = "withdrawing",
  transferring = "transferring"
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "Runner" + Game.time.toString(),
    body: body,
    memory: {
      state: State.withdrawing
    }
  }
}

function* body(): CreepBodyGenerator {
  let currentBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
  yield currentBody; // minimum

  while (true) {
    currentBody = currentBody.concat([MOVE,CARRY]);
    yield currentBody;
    currentBody = currentBody.concat([CARRY]);
    yield currentBody;
  }
}

export const canSpawn = (room: Room) => {
  const mineLocations = room.memory.mineLocations;
  if (!mineLocations) {
    return false;
  }

  const storage = room.find(FIND_MY_STRUCTURES).find(s => s.structureType === "storage");
  if (!storage) {
    return false;
  }

  return true;
}

export const run = (creep: Creep, memory: Memory) => {
  switch (memory.state) {
    default:
    case State.withdrawing:
      memory.state = withdraw(creep, memory);
      break;
    case State.transferring:
      memory.state = transfer(creep, memory);
      break;
  }
};

const withdraw = (creep: Creep, memory: Memory): State => {
  const container = getContainer(creep, memory);
  if (!container) {
    return State.withdrawing;
  }

  const result = creep.withdraw(container, "energy");
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
  }

  if (creep.store.getFreeCapacity() === 0) {
    creep.say("🚀");
    return State.transferring;
  }

  return State.withdrawing;
}

const transfer = (creep: Creep, memory: Memory): State => {
  const target = getStorage(creep, memory);
  if (!target) {
    return State.withdrawing;
  }
  const result = creep.transfer(target, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.withdrawing;
  }

  return State.transferring;
}

const getContainer = (creep: Creep, memory: Memory): StructureContainer | null => {
  const post = getPost(creep, memory);
  const storage = creep.room.lookForAt(LOOK_STRUCTURES, post.containerPos.x, post.containerPos.y).find(s => s.structureType === "container");
  if (storage) {
    return storage as StructureContainer;
  }

  return null;
}

const getStorage = (creep: Creep, memory: Memory): StructureStorage | null => {
  const post = getPost(creep, memory);
  const storage = creep.room.lookForAt(LOOK_STRUCTURES, post.storagePos.x, post.storagePos.y).find(s => s.structureType === "storage");
  if (storage) {
    return storage as StructureStorage;
  }

  return null;
}

const getPost = (creep: Creep, memory: Memory): RunLocation => {
  if (memory.post) {
    return memory.post;
  }

  const existingPost = getExistingRunLocation(creep);
  if (existingPost) {
    return existingPost;
  }

  const availablePost = getAvailableRunLocation(creep);
  if (availablePost) {
    availablePost.creepName = creep.name;
    return availablePost;
  }

  throw new Error("No post available");
}

const getExistingRunLocation = (creep: Creep): RunLocation | null => {
  return getRunLocations(creep).find(p => p.creepName === creep.name) ?? null;
}

const getAvailableRunLocation = (creep: Creep): RunLocation | null => {
  return getRunLocations(creep).find(p => !p.creepName || !Game.creeps[p.creepName]) ?? null;
}

export const getAvailableRunLocations = (creep: Creep): RunLocation[] => {
  return getRunLocations(creep).filter(p => !p.creepName || !Game.creeps[p.creepName]);
}

const getRunLocations = (creep: Creep): RunLocation[] => {
  if (creep.room.memory.runLocations) {
    return creep.room.memory.runLocations;
  }

  const mineLocations = creep.room.memory.mineLocations;
  if (!mineLocations) {
    throw new Error("Mine locations not initialised");
  }

  const storage = creep.room.find(FIND_MY_STRUCTURES).find(s => s.structureType === "storage");
  if (!storage) {
    throw new Error("No storage");
  }

  const storagePos = storage.pos;

  return mineLocations.map(l => {
    const containerPos = l.containerPos;
    const path = creep.room.getPositionAt(containerPos.x, containerPos.y)!.findPathTo(storagePos.x, storagePos.y);
    return {
      containerPos: containerPos,
      storagePos: storagePos,
      path: path
    }
  });
}
