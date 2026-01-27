import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import {
  sendApprovalEmail,
  sendManualRevocationEmail,
  sendReminderEmail,
} from "$lib/server/email";
import fs from "fs/promises";

export const actions: Actions = {
  approve: async ({ request }) => {
    const form = await request.formData();
    const id = form.get("id") as string;

    if (!id) {
      return;
    }

    const application = await prisma.application.findFirst({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return;
    }

    const newApprovedStatus = !application.approved;

    await prisma.application.update({
      where: { id },
      data: {
        approved: newApprovedStatus,
        checkedIn: newApprovedStatus ? application.checkedIn : false,
      },
    });

    if (newApprovedStatus) {
      await sendApprovalEmail(application.email);
    } else {
      await sendManualRevocationEmail(application.email);
    }
  },
  checkIn: async ({ request }) => {
    const form = await request.formData();
    const id = form.get("id") as string;

    if (!id) {
      return;
    }

    await prisma.application.update({
      where: { id },
      data: { checkedIn: true },
    });
  },
  exportEmails: async () => {
    const approvedApplications = await prisma.application.findMany({
      where: { approved: true },
      select: { email: true },
    });

    const emails = approvedApplications.map((app) => app.email).join("\n");

    return {
      success: true,
      emails,
    };
  },
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get("id") as string;

    if (!id) {
      return;
    }

    try {
      await fs.unlink(`./resumes/${id}.pdf`);
    } catch {
      // Ignore if file doesn't exist
    }

    await prisma.application.delete({
      where: { id },
    });
  },
  sendReminders: async () => {
    // Find users who definitely DO NOT have a submitted application
    // This includes users with no application at all, or users with an unsubmitted application
    // Logic: Users where NOT EXISTS "an application where submitted is true"
    const usersToRemind = await prisma.user.findMany({
      where: {
        NOT: {
          Application: {
            some: {
              submitted: true,
            },
          },
        },
      },
      select: {
        email: true,
      },
    });

    let sentCount = 0;
    for (const user of usersToRemind) {
      if (user.email) {
        await sendReminderEmail(user.email);
        sentCount++;
      }
    }

    return {
      success: true,
      sentCount,
    };
  },
};

export const load: PageServerLoad = async () => {
  const applications = await prisma.application.findMany({
    include: {
      user: true,
    },
    orderBy: [{ approved: "desc" }, { updatedAt: "desc" }],
  });

  const totalApplications = applications.length;
  const approvedApplications = applications.filter(
    (app) => app.approved,
  ).length;
  const checkedInApplications = applications.filter(
    (app) => app.checkedIn,
  ).length;

  const applicationsWithResume = await Promise.all(
    applications.map(async (app) => {
      try {
        await fs.access(`./resumes/${app.id}.pdf`);
        return { ...app, hasResume: true };
      } catch {
        return { ...app, hasResume: false };
      }
    }),
  );

  return {
    applications: applicationsWithResume,
    stats: {
      total: totalApplications,
      approved: approvedApplications,
      checkedIn: checkedInApplications,
    },
  };
};
