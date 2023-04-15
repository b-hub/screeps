import { isAlive } from "../utils";

const idleThoughts = ["🤩", "💗", "🤗", "😲"];
const celebrationThoughts = ["🎉", "🎂", "👏", "🙌"];

type Memory = {
  state: State;
};

enum State {
  travelling,
  waiting,
  celebrating
}

export const run = (creep: Creep, memory: Memory) => {
  switch (memory.state) {
    default:
    case State.travelling:
      memory.state = travel(creep);
      break;
    case State.waiting:
      memory.state = wait(creep);
      break;
    case State.celebrating:
      memory.state = celebrate(creep);
      break;
  }
};

const travel = (creep: Creep): State => {
  const spawn = findSpawn(creep);
  if (spawn === null) {
    creep.say("⁉️");
    return State.waiting;
  }

  if (creep.pos.getRangeTo(spawn) <= 1) {
    creep.say("👀");
    return State.waiting;
  }

  creep.moveTo(spawn);

  return State.travelling;
};

const wait = (creep: Creep) => {
  const thought = think(idleThoughts, 0.1);
  if (thought) {
    creep.say(thought);
  }

  return isAlive(Game.creeps.Steve) ? State.celebrating : State.waiting;
}

const celebrate = (creep: Creep) => {
  const thought = think(celebrationThoughts, 0.9);
  if (thought) {
    creep.say(thought);
  }

  return State.celebrating;
}

const think = (thoughts: string[], chanceToHaveThought: number): string | null => {
  if (Math.random() > chanceToHaveThought) {
    return null;
  }

  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

const findSpawn = (creep: Creep): StructureSpawn | null => {
  const spawns = creep.room.find(FIND_MY_SPAWNS);
  return spawns.length > 0
    ? spawns[0]
    : null;
}
