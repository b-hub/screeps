export type CreepBodyGenerator = Generator<BodyPartConstant[], BodyPartConstant[], unknown>;

export type CreepSpawnConfig = {
  name: string;
  body: () => CreepBodyGenerator;
  memory: any;
};

export enum CreepJob {
  upgrade = "upgrade",
  spawnSupplier = "spawnSupplier"
};
