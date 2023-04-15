import * as Steve from "creeps/Steve";
import {CreepSpawnConfig, CreepBodyGenerator} from "creeps/roles/utils";
import { isRole, Roles, Role } from "creeps/roles";

export const run = () => {
  for (const name in Game.spawns) {
    const spawn = Game.spawns[name];
    runSpawn(spawn);
  }
};

const runSpawn = (spawn: StructureSpawn) => {
  const steve = Game.creeps.Steve;
  if (!steve) {
    spawnCreep(spawn, Steve.spawnConfig(), "");
    return;
  }

  const role = spawn.memory.nextRole;
  if (isRole(role)) {
    console.log(role, "is next role");
    spawnCreep(spawn, Roles[role].spawnConfig(), role);
  }
}

const spawnCreep = (spawn: StructureSpawn, config: CreepSpawnConfig, role: string) => {
  if (spawn.room.energyAvailable !== spawn.room.energyCapacityAvailable) {
    return;
  }

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
        role: role,
        current: config.memory
      }
    });
  } else if (result === ERR_NOT_ENOUGH_ENERGY) {
    console.log("Not enough energy for body", body);
  }
}

const maxBody = (bodyGenerator: CreepBodyGenerator, energy: number): BodyPartConstant[] | undefined  => {
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
