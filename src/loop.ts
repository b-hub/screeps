import * as CreepManager from "managers/CreepManager";
import * as SpawnManager from "managers/SpawnManager";
import { cleanMemory } from "utils/GameUtils";
import { exportStats } from "utils/StatsUtils";

export const gameLoop = () => {
  cleanMemory();

  SpawnManager.run();
  CreepManager.run();

  exportStats();
};
