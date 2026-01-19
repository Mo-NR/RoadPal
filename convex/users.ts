import { query, mutation } from "./_generated/server";

// Query: Get current user
export const getMe = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Find user by auth identity
  const user = await ctx.db
    .query("appUsers")
    .withIndex("by_identity", (q) => q.eq("identityId", identity.subject))
    .first();

  return user;
});

// Mutation: Ensure user exists on login
export const ensureUserOnLogin = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Check if appUsers row already exists
  const existingUser = await ctx.db
    .query("appUsers")
    .withIndex("by_identity", (q) => q.eq("identityId", identity.subject))
    .first();

  const now = Date.now();

  if (existingUser) {
    // Update existing user - patch updatedAt and optional fields, preserve createdAt
    await ctx.db.patch(existingUser._id, {
      email: identity.email ?? existingUser.email,
      name: identity.name ?? existingUser.name,
      image: identity.pictureUrl ?? existingUser.image,
      updatedAt: now,
    });
    return await ctx.db.get(existingUser._id);
  } else {
    // Create new appUsers row
    const userId = await ctx.db.insert("appUsers", {
      identityId: identity.subject,
      email: identity.email,
      name: identity.name,
      image: identity.pictureUrl,
      role: "student",
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(userId);
  }
});

// Mutation: Make current user admin (dev-only)
export const makeMeAdmin = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("appUsers")
    .withIndex("by_identity", (q) => q.eq("identityId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  await ctx.db.patch(user._id, {
    role: "admin",
    updatedAt: Date.now(),
  });

  return await ctx.db.get(user._id);
});
