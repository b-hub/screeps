import { BodyGenerator, SpawnConfig } from "./utils";
import * as Upgrader from "./Upgrader";
import * as SpawnEnergiser from "./SpawnEnergiser";

type SteveMemory = {
  role: SteveRole;
  current: any;
};

enum SteveRole {
  upgrader,
  spawnEnergiser,
}

export const spawnConfig = (): SpawnConfig => {
  return {
    name: "Steve", // there can only be one
    body: body,
    memory: {
      role: SteveRole.spawnEnergiser, // get other creeps spawning faster
      current: {}
    }
  }
}

function* body(): BodyGenerator {
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

export const run = (creep: Creep, memory: SteveMemory) => {
  const creepRole = memory.role;

  switch (creepRole) {
    case SteveRole.spawnEnergiser:
      SpawnEnergiser.run(creep, creep.memory.current);
      break;
    case SteveRole.upgrader:
      Upgrader.run(creep, creep.memory.current);
      break;
    default:
      console.log(`unknown creep role '${creepRole}'`);
      break;
  }
};
