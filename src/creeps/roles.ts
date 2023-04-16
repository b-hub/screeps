import * as Roles from "./roles/index";

export { Roles };
export type Role = keyof typeof Roles;
export const isRole = (role: string): role is Role => role in Roles;
