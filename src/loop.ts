import { CreepManager } from "managers/CreepManager";
import { SpawnManager } from "managers/SpawnManager";
import { cleanMemory } from "utils/GameUtils";
import { exportStats } from "utils/StatsUtils";

export const gameLoop = () => {
  console.log(`Current game tick is ${Game.time}`);
  cleanMemory();

  SpawnManager.run();
  CreepManager.run();

  exportStats();
};
