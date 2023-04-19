import * as Steve from "creeps/Steve";
import {CreepSpawnConfig, CreepBodyGenerator} from "creeps/roles/utils";
import { isRole, Roles, Role } from "creeps/roles";
import { isAlive } from "../creeps/utils";

export const run = () => {
  for (const name in Game.spawns) {
    const spawn = Game.spawns[name];
    runSpawn(spawn);
  }
};

const runSpawn = (spawn: StructureSpawn) => {
  const useMaxEnergy = spawn.room.find(FIND_MY_CREEPS).some(c => c.memory.role === "Supplier");

  if (!isAlive(Game.creeps.Steve)) {
    spawnCreep(spawn, Steve.spawnConfig(), "", useMaxEnergy);
    return;
  }

  const role = spawn.memory.nextRole;
  if (role && isRole(role) && spawnCreep(spawn, Roles[role].spawnConfig(), role, useMaxEnergy)) {
    spawn.memory.nextRole = undefined;
  }
}

const spawnCreep = (spawn: StructureSpawn, config: CreepSpawnConfig, role: string, useMaxEnergy: boolean): boolean => {
  if (useMaxEnergy && spawn.room.energyAvailable !== spawn.room.energyCapacityAvailable) {
    return false;
  }

  const name = config.name;
  const body = maxBody(config.body(), spawn.room.energyAvailable);
  if (!body) {
    console.log("Failed to spawn with available energy: ", spawn.room.energyAvailable);
    return false;
  }

  let result = spawn.spawnCreep(body, name, {
    dryRun: true
  });

  if (result === OK) {
    result = spawn.spawnCreep(body, name, {
      dryRun: false,
      memory: {
        role: role,
        current: config.memory
      }
    });
  } else if (result === ERR_NOT_ENOUGH_ENERGY) {
    console.log("Not enough energy for body", body);
  }

  return result === OK;
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
