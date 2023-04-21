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
  const post = findAndAssignPost(creep, memory);
  if (!post) {
    console.log("No post!");
    return;
  }

  switch (memory.state) {
    default:
    case State.harvesting:
      memory.state = harvest(creep, memory);
      break;
    case State.transferring:
      memory.state = transfer(creep, post);
      break;
    case State.building:
      memory.state = build(creep, post);
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

const build = (creep: Creep, post: MineLocation): State => {
  // own position has a container
  if (creep.room.getPositionAt(post.minePos.x, post.minePos.y)?.lookFor(LOOK_STRUCTURES).length ?? 0 > 0) {
    return State.transferring;
  }

  let sitePos: RoomPosition | null = null;
  for (let i = 0; i < post.allMinePos.length; i++) {
    const containerPos = post.allMinePos[i];
    sitePos = creep.room.getPositionAt(containerPos.x, containerPos.y);
    if (!sitePos) {
      console.log("invalid position");
      return State.building;
    }

    if (sitePos.lookFor(LOOK_STRUCTURES).length > 0) {
      return State.transferring;
    }
  }

  let sites = sitePos!.lookFor(LOOK_CONSTRUCTION_SITES);
  if (sitePos && sites && sites.length === 0) {
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

const transfer = (creep: Creep, post: MineLocation): State => {
  const sitePos = creep.room.getPositionAt(post.minePos.x, post.minePos.y);
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

const findSource = (creep: Creep, memory: Memory): Source | null => {
  const post = findAndAssignPost(creep, memory);
  if (!post) {
    return null;
  }
  return creep.room.lookForAt(LOOK_SOURCES, post.sourcePos.x, post.sourcePos.y)[0]
}

const findAndAssignPost = (creep: Creep, memory: Memory): MineLocation | null  => {
  const room = creep.room;
  // if (memory.post) {
  //   return memory.post;
  // }

  const availablePost = existingMiningLocation(creep) ?? availableMiningLocation(room);

  if (!availablePost) {
    return null;
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
