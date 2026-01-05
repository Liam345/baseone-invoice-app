import type { Database } from "../client";
import { teams, usersOnTeam } from "../schema";
import { and, eq, sql } from "drizzle-orm";

export type GetTeamByIdParams = {
  id: string;
};

export async function getTeamById(db: Database, params: GetTeamByIdParams) {
  const [result] = await db
    .select({
      id: teams.id,
      name: teams.name,
      logoUrl: teams.logoUrl,
      email: teams.email,
      baseCurrency: teams.baseCurrency,
      countryCode: teams.countryCode,
      fiscalYearStartMonth: teams.fiscalYearStartMonth,
      plan: teams.plan,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .where(eq(teams.id, params.id))
    .limit(1);

  return result;
}

export type CreateTeamParams = {
  id?: string;
  name: string;
  email?: string;
  logoUrl?: string;
  baseCurrency?: string;
  countryCode?: string;
  fiscalYearStartMonth?: number;
};

export async function createTeam(db: Database, params: CreateTeamParams) {
  const [result] = await db
    .insert(teams)
    .values({
      ...params,
      baseCurrency: params.baseCurrency || "USD",
      fiscalYearStartMonth: params.fiscalYearStartMonth || 1,
    })
    .returning();

  return result;
}

export type UpdateTeamParams = {
  id: string;
  name?: string;
  email?: string;
  logoUrl?: string;
  baseCurrency?: string;
  countryCode?: string;
  fiscalYearStartMonth?: number;
};

export async function updateTeam(db: Database, params: UpdateTeamParams) {
  const { id, ...updateData } = params;

  const [result] = await db
    .update(teams)
    .set(updateData)
    .where(eq(teams.id, id))
    .returning();

  return result;
}

export type GetUserTeamsParams = {
  userId: string;
};

export async function getUserTeams(db: Database, params: GetUserTeamsParams) {
  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      logoUrl: teams.logoUrl,
      email: teams.email,
      baseCurrency: teams.baseCurrency,
      countryCode: teams.countryCode,
      plan: teams.plan,
      role: usersOnTeam.role,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .innerJoin(usersOnTeam, eq(usersOnTeam.teamId, teams.id))
    .where(eq(usersOnTeam.userId, params.userId));

  return result;
}

export type AddUserToTeamParams = {
  userId: string;
  teamId: string;
  role?: "owner" | "member";
};

export async function addUserToTeam(db: Database, params: AddUserToTeamParams) {
  const [result] = await db
    .insert(usersOnTeam)
    .values({
      userId: params.userId,
      teamId: params.teamId,
      role: params.role || "member",
    })
    .returning();

  return result;
}

export type RemoveUserFromTeamParams = {
  userId: string;
  teamId: string;
};

export async function removeUserFromTeam(
  db: Database,
  params: RemoveUserFromTeamParams,
) {
  await db
    .delete(usersOnTeam)
    .where(
      and(
        eq(usersOnTeam.userId, params.userId),
        eq(usersOnTeam.teamId, params.teamId),
      ),
    );

  return { success: true };
}