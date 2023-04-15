export type BodyGenerator = Generator<BodyPartConstant[], BodyPartConstant[], unknown>;

export type SpawnConfig = {
  name: string;
  body: () => BodyGenerator;
  memory: any;
}

export const currentMemory = <T,>(creep: Creep): T => {
  const memory = creep.memory as CreepMemory;
  return memory.current;
}
