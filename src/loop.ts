import { CreepManager } from "managers/CreepManager";
import { SpawnManager } from "managers/SpawnManager";
import { cleanMemory } from "utils/GameUtils";

export const gameLoop = () => {
  console.log(`Current game tick is ${Game.time}`);
  cleanMemory();

  SpawnManager.run();
  CreepManager.run();
};
