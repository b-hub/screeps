import { CreepRole } from "./CreepManager";
import * as Steve from "creeps/Steve";
import {SpawnConfig, BodyGenerator} from "creeps/utils";

export const run = () => {
  for (const name in Game.spawns) {
    const spawn = Game.spawns[name];
    runSpawn(spawn);
  }
};

const runSpawn = (spawn: StructureSpawn) => {
  const steveConfig = Steve.spawnConfig();
  if (!Game.creeps[steveConfig.name]) {
    console.log("No steve, spawning...")
    spawnCreep(spawn, steveConfig);
  }

}

const spawnCreep = (spawn: StructureSpawn, config: SpawnConfig) => {
  const name = config.name;
  const body = maxBody(config.body(), spawn.room.energyAvailable);
  if (!body) {
    console.log("Failed to spawn with available energy: ", spawn.room.energyAvailable);
    return;
  }

  const result = spawn.spawnCreep(body, name, {
    dryRun: true
  });

  if (result === OK) {
    spawn.spawnCreep(body, name, {
      dryRun: false,
      memory: {
        role: CreepRole.steve,
        current: config.memory
      }
    });
  } else if (result === ERR_NOT_ENOUGH_ENERGY) {
    console.log("Not enough energy for body", body);
  }
}

const maxBody = (bodyGenerator: BodyGenerator, energy: number): BodyPartConstant[] | undefined  => {
  let result;

  for (const body of bodyGenerator) {
    if (bodyCost(body) > energy) {
      return result;
    }

    result = body;
  }

  return result;
}

const bodyCost = (body: BodyPartConstant[]) => {
  return body.reduce((cost, part) => {
      return cost + BODYPART_COST[part];
  }, 0);
}
