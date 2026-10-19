import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string | null;
      creatorId: string | null;
      brandId: string | null;
      brandContactId: string | null;
      cohortIds: string[];
    };
  }
}
