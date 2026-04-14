"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/auth";
import { canManageUsers, USER_ROLES } from "@/lib/access";

import { revalidatePath } from "next/cache";

/** ---------- Register ---------- */
export const registerUser = async (_prevState, formData) => {
  try {
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!name || !email || !password) {
      return { success: false, msg: "Required fields are missing" };
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { success: false, msg: "User already exists" };
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const isBootstrapAdmin = userCount === 0;

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        role: isBootstrapAdmin ? USER_ROLES.ADMIN : USER_ROLES.AUTHOR,
        approved: isBootstrapAdmin,
      },
      select: { id: true, name: true, role: true, approved: true },
    });

    if (created.role === USER_ROLES.ADMIN) {
      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      return { success: true, msg: `${created.name} Welcome`, redirectTo: "/dashboard" };
    }

    return {
      success: true,
      msg: "Account created. Wait for admin approval before logging in.",
      redirectTo: "/",
    };
  } catch (err) {
    console.error("registerUser error:", err);
    return { success: false, msg: "Something went wrong" };
  }
};

/** ---------- Login ---------- */
// export const loginUser = async (_prevState, formData) => {
//   try {
//     const email = formData.get("email");
//     const password = formData.get("password");

//     if (!email || !password) {
//       return { success: false, msg: "Email and password are required" };
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: { id: true, email: true, password: true },
//     });

//     if (!user) {
//       return { success: false, msg: "User doesnt exist, Please Register." };
//     }

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return { success: false, msg: "Password didnt match" };
//     }

//     await signIn("credentials", {
//       redirectTo: "/dashboard",
//       email,
//       password,
//     });

//     return { success: true, msg: "Logged in" };
//   } catch (err) {
//     const message =
//       typeof err?.message === "string" ? err.message : "Login failed";
//     console.error("loginUser error:", err);
//     return { success: false, msg: message };
//   }
// };
export const loginUser = async (_prevState, formData) => {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, msg: "Email and password are required" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        approved: true,
      },
    });

    if (!user) {
      return { success: false, msg: "User doesn't exist. Please Register." };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, msg: "Password didn't match" };
    }
    if (user.role !== USER_ROLES.ADMIN && !user.approved) {
      return {
        success: false,
        msg: "Your author account is pending admin approval.",
      };
    }

    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    return { success: true, msg: "Login successful", userId: user.id };
  } catch (err) {
    console.error("loginUser error:", err);
    return { success: false, msg: "Something went wrong" };
  }
};
/** ---------- Logout ---------- */
export const logOut = async () => {
  try {
    await signOut({ redirect: false }); // don't let NextAuth auto-redirect
    return { success: true };
  } catch (err) {
    console.error("logOut error:", err);
    return { success: false };
  }
};

/** ---------- List Users ---------- */
export const userList = async () => {
  try {
    const session = await auth();
    if (!canManageUsers(session?.user)) {
      return [];
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (err) {
    console.error("userList error:", err);
    return [];
  }
};

export const createUserByAdmin = async (_prevState, formData) => {
  try {
    const session = await auth();

    if (!canManageUsers(session?.user)) {
      return { success: false, msg: "Unauthorized" };
    }

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();
    const role = formData.get("role")?.toString();

    if (!name || !email || !password || !role) {
      return { success: false, msg: "Required fields are missing" };
    }

    if (!Object.values(USER_ROLES).includes(role)) {
      return { success: false, msg: "Invalid role selected" };
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, msg: "User already exists" };
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        role,
        approved: true,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true, msg: "User created successfully" };
  } catch (err) {
    console.error("createUserByAdmin error:", err);
    return { success: false, msg: "Something went wrong" };
  }
};

/** ---------- Get User Profile ---------- */
export const getUserProfile = async () => {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return { user: null };

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        approved: true,
        createdAt: true,
      },
    });

    return { user };
  } catch (err) {
    console.error("getUserProfile error:", err);
    return { user: null };
  }
};

export const updateUserProfile = async (
  _prevState,
  { userId, name }
) => {
  if (!userId) {
    return { success: false, msg: "User ID is required" };
  }

  const data = {
    name: name?.trim() || undefined,
  };

  try {
    await prisma.$executeRaw`
      UPDATE "public"."User"
      SET "name" = ${data.name}
      WHERE "id" = ${userId}
    `;

    revalidatePath("/dashboard/profile");
    return { success: true, msg: "Profile updated" };
  } catch (err) {
    console.error("updateUserProfile error:", err);
    return { success: false, msg: "Failed to update profile" };
  }
};

export const updateUserRole = async ({ userId, role }) => {
  try {
    const session = await auth();
    if (!canManageUsers(session?.user)) {
      return { success: false, msg: "Unauthorized" };
    }

    if (!userId || !Object.values(USER_ROLES).includes(role)) {
      return { success: false, msg: "Invalid request" };
    }
    if (session.user.id === userId) {
      return { success: false, msg: "You can't change your own role" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/dashboard/users");
    return { success: true, msg: "User role updated" };
  } catch (err) {
    console.error("updateUserRole error:", err);
    return { success: false, msg: "Failed to update role" };
  }
};

export const updateUserApproval = async ({ userId, approved }) => {
  try {
    const session = await auth();
    if (!canManageUsers(session?.user)) {
      return { success: false, msg: "Unauthorized" };
    }

    if (!userId || typeof approved !== "boolean") {
      return { success: false, msg: "Invalid request" };
    }
    if (session.user.id === userId && approved === false) {
      return { success: false, msg: "You can't revoke your own approval" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { approved },
    });

    revalidatePath("/dashboard/users");
    return {
      success: true,
      msg: approved ? "User approved" : "User approval removed",
    };
  } catch (err) {
    console.error("updateUserApproval error:", err);
    return { success: false, msg: "Failed to update approval" };
  }
};

export const updateUserProfileImage = async (
  _prevState,
  { userId, imageUrl }
) => {
  if (!userId || !imageUrl) {
    throw new Error("User ID and image URL are required");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: imageUrl },
  });

  return updatedUser;
};
