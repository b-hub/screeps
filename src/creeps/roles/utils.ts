export type CreepBodyGenerator = Generator<BodyPartConstant[], BodyPartConstant[], unknown>;

export type CreepSpawnConfig = {
  name: string;
  body: () => CreepBodyGenerator;
  memory: any;
};


