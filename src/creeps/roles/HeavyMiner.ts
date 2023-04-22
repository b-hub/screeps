import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";

const CONTAINER_REPAIR_TICS_THRESHOLD = 500;

type Memory = {
  state: State;
  post?: MineLocation;
};

enum State {
  transferring = "transferring",
  building = "building",
  harvesting = "harvesting",
  repairing = "repairing"
}

export const spawnConfig = (): CreepSpawnConfig => {
  return {
    name: "HeavyMiner" + Game.time.toString(),
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
      memory.state = harvest(creep, memory);
      break;
    case State.building:
      memory.state = build(creep, memory);
      break;
    case State.repairing:
      memory.state = repair(creep, memory);
      break;
    case State.transferring:
      memory.state = transfer(creep, memory);
      break;
  }
};

const harvest = (creep: Creep, memory: Memory): State => {
  const source = findSource(creep, memory);
  if (source === null) {
    return State.harvesting;
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

const build = (creep: Creep, memory: Memory): State => {
  const post = getPost(creep, memory);
  // own position has a container
  if (getContainer(creep, memory)) {
    return State.repairing;
  }

  const site = getConstructionSite(creep, memory);
  if (!site) {
    return State.repairing;
  }

  const result = creep.build(site)

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(site);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.building;
};

const repair = (creep: Creep, memory: Memory): State => {
  const containers = getAllContainers(creep, memory);
  if (!containers.length) {
    return State.building;
  }

  const container = containers.find(c => c.ticksToDecay < CONTAINER_REPAIR_TICS_THRESHOLD)
  if (!container) {
    return State.transferring;
  }

  const result = creep.repair(container);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.repairing;
}

const transfer = (creep: Creep, memory: Memory): State => {
  const container = getContainer(creep, memory);
  if (!container) {
    return State.building;
  }

  const result = creep.transfer(container, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(container);
  }

  if (creep.store.getUsedCapacity() === 0) {
    creep.say("⛏️");
    return State.harvesting;
  }

  return State.transferring;
};

const findSource = (creep: Creep, memory: Memory): Source | null => {
  const post = getPost(creep, memory);
  if (!post) {
    return null;
  }
  return creep.room.lookForAt(LOOK_SOURCES, post.sourcePos.x, post.sourcePos.y)[0]
}

const getAllContainers = (creep: Creep, memory: Memory): StructureContainer[] => {
  const post = getPost(creep, memory);

  return post.allMinePos.map(p => creep.room.lookForAt(LOOK_STRUCTURES, p.x, p.y).find(s => s.structureType === "container"))
    .filter(s => !!s)
    .map(s => s as StructureContainer);
}

const getContainer = (creep: Creep, memory: Memory): StructureContainer | null => {
  const post = getPost(creep, memory);
  const sitePos = creep.room.getPositionAt(post.minePos.x, post.minePos.y);
  if (!sitePos) {
    throw new Error("Invalid mining post");
  }
  const container = sitePos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === "container");
  if (!container) {
    return null;
  }

  return container as StructureContainer;
}

const getConstructionSite = (creep: Creep, memory: Memory): ConstructionSite | null => {
  const post = getPost(creep, memory);

  for (let i = 0; i < post.allMinePos.length; i++) {
    const pos = post.allMinePos[i];

    if (creep.room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y).find(s => s.structureType === "container")) {
      continue;
    }

    const site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y)[0];
    if (site) {
      return site;
    }

    creep.say("🚧");
    creep.room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
    return creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y)[0] ?? null;
  }

  return null;
}

const getPost = (creep: Creep, memory: Memory): MineLocation => {
  const room = creep.room;
  if (memory.post) {
    return memory.post;
  }

  const availablePost = existingMiningLocation(creep) ?? availableMiningLocation(room);

  if (!availablePost) {
    throw new Error("No available post");
  }

  availablePost.creepName = creep.name;
  memory.post = availablePost;
  return memory.post;
}

export const existingMiningLocation = (creep: Creep): MineLocation | undefined => {
  return roomMineLocs(creep.room).find(p => p.creepName === creep.name);
}

export const availableMiningLocation = (room: Room): MineLocation | undefined => {
  return roomMineLocs(room).find(p => !p.creepName || !Game.creeps[p.creepName]);
}

export const availableMiningLocations = (room: Room): MineLocation[] => {
  return roomMineLocs(room).filter(p => !p.creepName || !Game.creeps[p.creepName]);
}

const roomMineLocs = (room: Room): MineLocation[] => {
  if (room.memory.mineLocations) {
    return room.memory.mineLocations;
  }

  const sources = room.find(FIND_SOURCES);
  const locs = sources.map(sourceMineLocs).reduce((a, b) => a.concat(b), []);

  room.memory.mineLocations = locs;
  return locs;
}

const sourceMineLocs = (source: Source): MineLocation[] => {
  const room = source.room;
  const positions: RoomPosition[] = [];

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const pos = room.getPositionAt(source.pos.x + i, source.pos.y + j);
      if (!pos) continue;
      const terrain = room.getTerrain().get(pos.x, pos.y);
      if (terrain === 0 || terrain === TERRAIN_MASK_SWAMP) {
        positions.push(pos);
      }
    }
  }

  return positions.map(p => ({minePos: p, sourcePos: source.pos, allMinePos: positions}));
}
