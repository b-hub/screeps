import { CreepBodyGenerator, CreepSpawnConfig } from "./utils";

type Memory = {
  state: State;
  post?: MineLocation;
};

enum State {
  transferring = "transferring",
  building = "building",
  harvesting = "harvesting",
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
    case State.transferring:
      memory.state = transfer(creep, memory);
      break;
    case State.building:
      memory.state = build(creep, memory);
      break;
  }
};

const harvest = (creep: Creep, memory: Memory): State => {
  const source = findAndAssignSource(creep, memory);
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
  const containerPos = memory.post?.minePos;
  if (!containerPos) {
    console.log("something went wrong");
    return State.building;
  }

  const sitePos = creep.room.getPositionAt(containerPos.x, containerPos.y);
  if (!sitePos) {
    console.log("invalid position");
    return State.building;
  }

  if (sitePos.lookFor(LOOK_STRUCTURES).length > 0) {
    return State.transferring;
  }

  let sites = sitePos?.lookFor(LOOK_CONSTRUCTION_SITES);
  if (sites && sites.length === 0) {
    creep.say("🚧");
    creep.room.createConstructionSite(sitePos, STRUCTURE_CONTAINER);
    sites = sitePos.lookFor(LOOK_CONSTRUCTION_SITES);
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
};

const transfer = (creep: Creep, memory: Memory): State => {
  const containerPos = memory.post?.minePos;
  if (!containerPos) {
    return State.building;
  }

  const sitePos = creep.room.getPositionAt(containerPos.x, containerPos.y);
  if (!sitePos) {
    console.log("Invalid site position");
    return State.transferring;
  }
  const container = sitePos.lookFor(LOOK_STRUCTURES)[0];
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

const findAndAssignSource = (creep: Creep, memory: Memory): Source | null => {
  const room = creep.room;
  if (memory.post) {
    return room.lookForAt(LOOK_SOURCES, memory.post.sourcePos.x, memory.post.sourcePos.y)[0];
  }

  const availablePost = availableMiningLocation(room);

  if (!availablePost) {
    return null;
  }

  availablePost.creepName = creep.name;
  memory.post = availablePost;
  return room.lookForAt(LOOK_SOURCES, availablePost.sourcePos.x, availablePost.sourcePos.y)[0];
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
      if (pos && room.getTerrain().get(pos.x, pos.y) === 0) {
        positions.push(pos);
      }
    }
  }

  return positions.map(p => ({minePos: p, sourcePos: source.pos}));
}
