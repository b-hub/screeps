export type BodyGenerator = Generator<BodyPartConstant[], BodyPartConstant[], unknown>;

export type SpawnConfig = {
  name: string;
  body: () => BodyGenerator;
  memory: any;
}
