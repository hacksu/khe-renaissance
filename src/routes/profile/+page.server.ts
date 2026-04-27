import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Utils } from "$lib/util";
import { sendApprovalEmail, sendApprovalRevokedEmail } from "$lib/server/email";
import { error, redirect, type Actions } from "@sveltejs/kit";
import fs from "fs/promises";
import countries from "../../assets/json/countries.json";
import schools from "../../assets/json/schools.json";
import type { PageServerLoad } from "./$types";

const saveApplication = async (userId: string, form: FormData) => {
  const formValues = Utils.formToDict(form);
  // Multi-value field — getAll returns all checked boxes as an array
  const areasOfInterest = (form.getAll("areas-of-interest") as string[]).join(",");

  // Fetch current application to check for changes
  const currentApplication = await prisma.application.findUnique({
    where: { userId },
  });

  if (!currentApplication) {
    throw new Error("Application not found");
  }

  // Detect if there are any changes
  const hasChanges =
    currentApplication.firstName !== formValues["first-name"] ||
    currentApplication.lastName !== formValues["last-name"] ||
    currentApplication.phoneNumber !== formValues["phone-number"] ||
    currentApplication.email !== formValues["email"] ||
    currentApplication.countryOfResidence !==
      formValues["country-of-residence"] ||
    currentApplication.school !== formValues["school"] ||
    currentApplication.levelOfStudy !== formValues["level-of-study"] ||
    currentApplication.fieldOfStudy !== formValues["field-of-study"] ||
    currentApplication.githubUrl !== formValues["github-url"] ||
    currentApplication.projectIdea !== formValues["project-idea"] ||
    currentApplication.age !== Utils.toNumber(formValues["age"]) ||
    currentApplication.dietaryRestriction !==
      formValues["dietary-restriction"] ||
    currentApplication.gender !== formValues["gender"] ||
    currentApplication.pronouns !== formValues["pronouns"] ||
    currentApplication.personalUrl !== formValues["personal-url"] ||
    currentApplication.raceEthnicity !== formValues["race-ethnicity"] ||
    currentApplication.sexuality !== formValues["sexuality"] ||
    currentApplication.firstGenStudent !== formValues["first-gen-student"] ||
    currentApplication.hackatonsAttended !== formValues["hackathons-attended"] ||
    currentApplication.experienceLevel !== formValues["experience-level"] ||
    currentApplication.areasOfInterest !== areasOfInterest ||
    currentApplication.heardAboutUs !== formValues["heard-about-us"] ||
    currentApplication.linkedinUrl !== formValues["linkedin-url"] ||
    currentApplication.interestedInSponsors !== formValues["interested-in-sponsors"] ||
    currentApplication.teamPreference !== formValues["team-preference"] ||
    currentApplication.tshirtSize !== formValues["tshirt-size"] ||
    currentApplication.mlhCodeOfConduct !== !!formValues["mlh-code"] ||
    currentApplication.mlhAuthorization !== !!formValues["mlh-authorization"] ||
    currentApplication.mlhEmails !== !!formValues["mlh-emails"];

  // Update fields ONLY. Do not touch approved/submitted status here.
  const application = await prisma.application.update({
    data: {
      firstName: formValues["first-name"],
      lastName: formValues["last-name"],
      phoneNumber: formValues["phone-number"],
      email: formValues["email"],
      countryOfResidence: formValues["country-of-residence"],
      school: formValues["school"],
      levelOfStudy: formValues["level-of-study"],
      fieldOfStudy: formValues["field-of-study"],
      githubUrl: formValues["github-url"],
      projectIdea: formValues["project-idea"] ?? "",
      age: Utils.toNumber(formValues["age"]),
      dietaryRestriction: formValues["dietary-restriction"],
      gender: formValues["gender"],
      pronouns: formValues["pronouns"],
      personalUrl: formValues["personal-url"],
      raceEthnicity: formValues["race-ethnicity"] ?? "",
      sexuality: formValues["sexuality"] ?? "",
      firstGenStudent: formValues["first-gen-student"] ?? "",
      hackatonsAttended: formValues["hackathons-attended"] ?? "",
      experienceLevel: formValues["experience-level"] ?? "",
      areasOfInterest: areasOfInterest,
      heardAboutUs: formValues["heard-about-us"] ?? "",
      linkedinUrl: formValues["linkedin-url"] ?? "",
      interestedInSponsors: formValues["interested-in-sponsors"] ?? "",
      teamPreference: formValues["team-preference"] ?? "",
      tshirtSize: formValues["tshirt-size"] ?? "",
      mlhCodeOfConduct: !!formValues["mlh-code"],
      mlhAuthorization: !!formValues["mlh-authorization"],
      mlhEmails: !!formValues["mlh-emails"],
    },
    where: { userId },
  });

  const resume = form.get("resume") as File | null;
  if (resume && resume.type === "application/pdf") {
    const buffer = await resume.bytes();
    await fs.writeFile(`./resumes/${application.id}.pdf`, buffer);
  }

  return {
    application,
    hasChanges,
    previousApproved: currentApplication.approved,
    previousSubmitted: currentApplication.submitted,
  };
};

export const actions: Actions = {
  save: async ({ request }) => {
    if (Utils.hasApplicationsClosed()) {
      throw error(403, "KHE 2026 has ended. Applications are now closed.");
    }

    const session = await auth.api.getSession(request);
    if (!session) {
      throw error(401, "Your session has expired. Please re-login.");
    }

    const userId = session.user.id;
    const form = await request.formData();
    const { application, hasChanges, previousApproved } = await saveApplication(userId, form);

    if (previousApproved && hasChanges) {
      await prisma.application.update({
        where: { id: application.id },
        data: { approved: false, submitted: false },
      });
      await sendApprovalRevokedEmail(application.email);
    }
  },
  submit: async ({ request }) => {
    if (Utils.hasApplicationsClosed()) {
      throw error(403, "KHE 2026 has ended. Applications are now closed.");
    }

    const session = await auth.api.getSession(request);
    if (!session) {
      throw error(401, "Your session has expired. Please re-login.");
    }

    const userId = session.user.id;
    const form = await request.formData();

    // We need to know if we are "Submitting" or "Un-submitting".
    // The button text toggles based on current state.
    // If currently submitted -> Unsubmit.
    // If currently NOT submitted -> Submit.

    // We call saveApplication first to save any potential edits made before clicking submit/unsubmit.
    const { application, hasChanges, previousApproved, previousSubmitted } =
      await saveApplication(userId, form);

    const isUnsubmitting = previousSubmitted;

    if (isUnsubmitting) {
      await prisma.application.update({
        where: { id: application.id },
        data: { submitted: false, submittedAt: null, approved: false, approvedAt: null },
      });
    } else {
      if (previousApproved && hasChanges) {
        await prisma.application.update({
          where: { id: application.id },
          data: { approved: false, approvedAt: null },
        });
        await sendApprovalRevokedEmail(application.email);
      }
      await prisma.application.update({
        where: { id: application.id },
        data: { submitted: true, submittedAt: new Date() },
      });
    }
  },
};

export const load: PageServerLoad = async ({ request }) => {
  const session = await auth.api.getSession(request);
  if (!session) {
    throw redirect(301, "/auth/login");
  }

  const userId = session.user.id;
  const applicationsClosed = Utils.hasApplicationsClosed();

  let application = await prisma.application
    .findUnique({
      where: { userId },
      omit: { userId: true },
    })
    .catch((_) => null);

  if (!application && !applicationsClosed) {
    application = await prisma.application.create({ data: { userId } });
  }

  let hasResume = false;
  try {
    if (application) {
      await fs.access(`./resumes/${application.id}.pdf`);
    } else {
      throw new Error("No application");
    }
    hasResume = true;
  } catch {
    hasResume = false;
  }

  const sortedSchools = [...schools].sort((a, b) => a.localeCompare(b));

  return { schools: sortedSchools, application, countries, hasResume, applicationsClosed };
};
