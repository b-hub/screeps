export const isAlive = (creep: Creep) => creep && creep.ticksToLive;
export const creepAge = (creep: Creep) => {
  if (!creep || !creep.ticksToLive) {
    return -1;
  }

  return CREEP_LIFE_TIME - creep.ticksToLive;
}
export const isSpawning = (creep: Creep) => creep && !creep.ticksToLive;
