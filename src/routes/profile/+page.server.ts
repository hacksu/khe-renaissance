import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Utils } from "$lib/util";
import { sendApprovalEmail, sendApprovalRevokedEmail } from "$lib/server/email";
import { error, redirect, type Actions } from "@sveltejs/kit";
import fs from "fs/promises";
import countries from "../../assets/json/countries.json";
import schools from "../../assets/json/schools.json";
import type { PageServerLoad } from "./$types";

const PHONE_RE    = /^\+?[\d\s\-().]{7,15}$/;
const GITHUB_RE   = /^https:\/\/github\.com\/.+/;
const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/in\/.+/;
const URL_RE      = /^https?:\/\/.+\..+/;

const saveApplication = async (userId: string, form: FormData) => {
  const formValues = Utils.formToDict(form);
  // Multi-value field -- getAll returns all checked boxes as an array
  const areasOfInterest = (form.getAll("areas-of-interest") as string[]).join(",");

  const phone = formValues["phone-number"] ?? "";
  if (phone && !PHONE_RE.test(phone)) throw new Error("Invalid phone number format.");

  const age = Utils.toNumber(formValues["age"]);
  if (age && (age < 13 || age > 100)) throw new Error("Age must be between 13 and 100.");

  const github = formValues["github-url"] ?? "";
  if (github && !GITHUB_RE.test(github)) throw new Error("Invalid GitHub URL.");

  const linkedin = formValues["linkedin-url"] ?? "";
  if (linkedin && !LINKEDIN_RE.test(linkedin)) throw new Error("Invalid LinkedIn URL.");

  const personal = formValues["personal-url"] ?? "";
  if (personal && !URL_RE.test(personal)) throw new Error("Invalid personal website URL.");

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
      throw error(403, "KHE 2027 has ended. Applications are now closed.");
    }

    const session = await auth.api.getSession({ headers: request.headers });
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
      throw error(403, "KHE 2027 has ended. Applications are now closed.");
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      throw error(401, "Your session has expired. Please re-login.");
    }

    const userId = session.user.id;
    const form = await request.formData();
    const { application } = await saveApplication(userId, form);

    await prisma.application.update({
      where: { id: application.id },
      data: { submitted: true, submittedAt: new Date() },
    });
  },

  unsubmit: async ({ request }) => {
    if (Utils.hasApplicationsClosed()) {
      throw error(403, "KHE 2027 has ended. Applications are now closed.");
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      throw error(401, "Your session has expired. Please re-login.");
    }

    const userId = session.user.id;
    const application = await prisma.application.findUnique({ where: { userId } });
    if (!application) throw error(404, "Application not found.");

    const wasApproved = application.approved;
    await prisma.application.update({
      where: { id: application.id },
      data: { submitted: false, submittedAt: null, approved: false, approvedAt: null },
    });

    if (wasApproved) {
      await sendApprovalRevokedEmail(application.email);
    }
  },
};

export const load: PageServerLoad = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
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
