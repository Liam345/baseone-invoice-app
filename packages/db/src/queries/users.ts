import type { Database } from "../client";
import { users, usersOnTeam, teams } from "../schema";
import { and, eq } from "drizzle-orm";

export type GetUserByIdParams = {
  id: string;
};

export async function getUserById(db: Database, params: GetUserByIdParams) {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      locale: users.locale,
      weekStartsOnMonday: users.weekStartsOnMonday,
      timeZone: users.timeZone,
      timeFormat: users.timeFormat,
      dateFormat: users.dateFormat,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, params.id))
    .limit(1);

  return result;
}

export type CreateUserParams = {
  id?: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  locale?: string;
  timeZone?: string;
};

export async function createUser(db: Database, params: CreateUserParams) {
  const [result] = await db
    .insert(users)
    .values({
      ...params,
      locale: params.locale || "en",
    })
    .returning();

  return result;
}

export type UpdateUserParams = {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  locale?: string;
  weekStartsOnMonday?: boolean;
  timeZone?: string;
  timeFormat?: number;
  dateFormat?: string;
};

export async function updateUser(db: Database, params: UpdateUserParams) {
  const { id, ...updateData } = params;

  const [result] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return result;
}

export type GetUserWithTeamsParams = {
  id: string;
};

export async function getUserWithTeams(db: Database, params: GetUserWithTeamsParams) {
  const user = await getUserById(db, { id: params.id });
  
  if (!user) {
    return null;
  }

  const userTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      logoUrl: teams.logoUrl,
      role: usersOnTeam.role,
      plan: teams.plan,
    })
    .from(teams)
    .innerJoin(usersOnTeam, eq(usersOnTeam.teamId, teams.id))
    .where(eq(usersOnTeam.userId, params.id));

  return {
    ...user,
    teams: userTeams,
  };
}