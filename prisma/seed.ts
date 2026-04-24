import { PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// --- Minimal valid single-page PDF (blank page, ~200 bytes) ---
const EMPTY_PDF = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n' +
    'xref\n0 4\n' +
    '0000000000 65535 f \n' +
    '0000000009 00000 n \n' +
    '0000000058 00000 n \n' +
    '0000000115 00000 n \n' +
    'trailer<</Size 4/Root 1 0 R>>\n' +
    'startxref\n190\n%%EOF\n'
);

// ---- RNG helpers ----
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function maybe(prob: number) { return Math.random() < prob; }

function randDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(d: Date, days: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
}

// ---- Demographic pools (Ohio/Midwest CS student realistic mix) ----
const firstNamesMale = [
    'James','John','Robert','Michael','William','David','Joseph','Charles','Thomas','Daniel',
    'Matthew','Anthony','Mark','Donald','Paul','Steven','Kenneth','Andrew','Joshua','Kevin',
    'Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Gary',
    'Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Frank','Benjamin',
    'Raymond','Gregory','Samuel','Patrick','Alexander','Jack','Dennis','Jerry','Tyler','Aaron',
    'Henry','Douglas','Adam','Nathan','Kyle','Ethan','Logan','Caleb','Dylan','Evan',
    'Wei','Ming','Jun','Hao','Yu','Liang','Chen','Kai','Jian','Xin',
    'Arjun','Rohan','Rahul','Vikram','Arun','Nikhil','Siddharth','Karthik','Ankit','Ravi',
    'Seung','Min','Ji','Hyun','Jae','Sung','Woo','Taek','Jin','Ho',
    'Carlos','Miguel','Diego','Luis','Juan','Alejandro','Ricardo','Andres','Fernando','Eduardo',
    'DeShawn','Marcus','Darius','Jamal','Malik','Andre','Terrence','Xavier','Jordan','Isaiah',
];

const firstNamesFemale = [
    'Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen',
    'Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna',
    'Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia',
    'Katherine','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen',
    'Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Catherine','Maria','Heather',
    'Aisha','Fatima','Zara','Amara','Nadia','Leila','Yasmin','Noor','Hana','Sana',
    'Mei','Ling','Xiao','Yuki','Sakura','Hana','Yuna','Ji-Young','Soo','Minji',
    'Priya','Ananya','Divya','Shreya','Pooja','Neha','Riya','Anika','Ishaan','Kavya',
    'Sofia','Isabella','Valentina','Camila','Lucia','Daniela','Gabriela','Natalia','Maria','Ana',
    'Aaliyah','Zoe','Maya','Layla','Amira','Destiny','Brianna','Jasmine','Diamond','Unique',
];

const lastNames = [
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
    'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
    'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
    'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
    'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
    'Zhang','Wang','Li','Liu','Chen','Yang','Huang','Wu','Zhou','Sun',
    'Patel','Shah','Kumar','Singh','Sharma','Gupta','Verma','Mehta','Nair','Rao',
    'Kim','Park','Choi','Jeong','Kang','Yoon','Lim','Han','Oh','Seo',
    'Kowalski','Nowak','Wiśniewski','Wójcik','Kowalczyk','Kaminski','Lewandowski',
    'Okafor','Adeyemi','Nwosu','Afolabi','Okonkwo','Chukwu','Eze','Bello',
    'Murphy','Sullivan','O\'Brien','Ryan','Kelly','Walsh','McCarthy','O\'Connor',
];

const schools = [
    { name: 'Kent State University', domain: 'kent.edu', weight: 45 },
    { name: 'University of Akron', domain: 'zips.uakron.edu', weight: 15 },
    { name: 'Cleveland State University', domain: 'vikes.csuohio.edu', weight: 10 },
    { name: 'Case Western Reserve University', domain: 'case.edu', weight: 8 },
    { name: 'Ohio State University', domain: 'buckeyemail.osu.edu', weight: 7 },
    { name: 'Ohio University', domain: 'ohio.edu', weight: 5 },
    { name: 'Youngstown State University', domain: 'student.ysu.edu', weight: 4 },
    { name: 'University of Pittsburgh', domain: 'pitt.edu', weight: 2 },
    { name: 'University of Michigan', domain: 'umich.edu', weight: 2 },
    { name: 'Hiram College', domain: 'hiram.edu', weight: 1 },
    { name: 'Walsh University', domain: 'walsh.edu', weight: 1 },
];

function pickWeightedSchool() {
    const total = schools.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const s of schools) { r -= s.weight; if (r <= 0) return s; }
    return schools[0];
}

const fieldsOfStudy = [
    'Computer Science','Computer Science','Computer Science','Computer Science',
    'Information Technology','Information Technology',
    'Computer Engineering','Computer Engineering',
    'Software Engineering',
    'Data Science',
    'Electrical Engineering',
    'Mathematics',
    'Cybersecurity','Cybersecurity',
    'Business Information Systems',
    'Game Design',
    'Artificial Intelligence',
    'Statistics',
    'Mechanical Engineering',
    'Information Systems',
];

const levelsOfStudy = [
    'Freshman','Freshman',
    'Sophomore','Sophomore','Sophomore',
    'Junior','Junior','Junior',
    'Senior','Senior','Senior',
    'Graduate',
    'Graduate',
];

const experienceLevels = [
    'Beginner','Beginner','Beginner',
    'Intermediate','Intermediate','Intermediate','Intermediate',
    'Advanced','Advanced',
    'Expert',
];

const hackatonsPool = ['0','0','0','1','1','2','2','3','3-5','5+'];

const interestPool = [
    'Web Development','Mobile Development','AI/ML','Game Development',
    'Cybersecurity','Data Science','IoT','Blockchain','AR/VR','DevOps',
    'Open Source','Robotics','Cloud Computing','Embedded Systems','UI/UX Design',
];

const heardAboutUsPool = [
    'Social Media','Social Media','Social Media',
    'Friend / Word of Mouth','Friend / Word of Mouth','Friend / Word of Mouth',
    'MLH','MLH',
    'Professor / Faculty',
    'Campus Club / Organization','Campus Club / Organization',
    'Discord',
    'Email Newsletter',
    'Flyer / Poster',
];

const pronounsPool = ['He/Him','She/Her','They/Them','He/They','She/They','Prefer not to say'];
const genders = ['Male','Male','Male','Female','Female','Female','Non-binary','Prefer not to say','Prefer not to say'];
const raceEthnicities = [
    'White / Caucasian','White / Caucasian','White / Caucasian',
    'Asian / Pacific Islander','Asian / Pacific Islander','Asian / Pacific Islander',
    'Hispanic / Latino','Hispanic / Latino',
    'Black / African American','Black / African American',
    'Two or more races',
    'Prefer not to say','Prefer not to say',
];
const sexualities = [
    'Heterosexual / Straight','Heterosexual / Straight','Heterosexual / Straight',
    'Heterosexual / Straight','Heterosexual / Straight',
    'Bisexual','Bisexual',
    'Gay / Lesbian',
    'Prefer not to say','Prefer not to say',
];
const dietaryRestrictions = [
    'None','None','None','None','None','None','None',
    'Vegetarian','Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Halal',
    'Kosher',
    'Nut Allergy',
];
const tshirtSizes = ['XS','S','S','M','M','M','M','L','L','L','XL','XL','XXL'];
const teamPrefs = ['Solo','With Friends','Either','Either','Either'];
const sponsorInterest = ['Yes','Yes','No','Maybe'];
const countries = [
    'United States','United States','United States','United States','United States',
    'United States','United States','United States','United States','United States',
    'India','India','China','South Korea','Nigeria','Canada','Mexico','Pakistan','Vietnam','Japan',
];

const githubUsernames = [
    'code-wizard','byte-bandit','hackmaster3000','devildevs','codeandcoffee',
    'notasenior','just-a-freshman','ketderpface','thereal-dev','404-brain-not-found',
    'segfaultking','nullpointer-exception','async-await-me','gitblame-me','0xdeadbeef',
    'stackover-nerd','kernelpanik','sudo-make-me','leetgrinder','recursion-lord',
    'heapoverflow','binarybard','polymorphic-pete','inheritanceman','abstractfactory',
    'designpatternsrock','agilewarrior','cicdpipeline','dockerwhale','kubemaster',
];

function genGithubUrl(firstName: string, lastName: string): string {
    if (maybe(0.12)) return ''; // no github
    if (maybe(0.15)) return `https://github.com/${pick(githubUsernames)}`;
    const slug = `${firstName.toLowerCase()}${lastName.toLowerCase()}${maybe(0.4) ? rand(1, 99) : ''}`;
    return `https://github.com/${slug}`;
}

function genProjectIdea(): string {
    const ideas = [
        'An AI-powered study assistant that generates flashcards from lecture notes using LLMs.',
        'A mobile app that connects students with local food banks and surplus meals.',
        'A gamified platform for learning programming concepts through puzzle-based challenges.',
        'A real-time campus safety alert system integrated with KSU\'s existing infrastructure.',
        'An accessibility tool that converts handwritten math equations into digital LaTeX.',
        'A smart home energy monitor that predicts usage patterns and suggests optimizations.',
        'A collaborative whiteboard tool for remote hackathon teams with AI brainstorming assistance.',
        'A browser extension that summarizes long academic papers into key bullet points.',
        'A mental health check-in app designed for college students with anonymous peer support.',
        'An AR treasure hunt experience designed for Kent State campus orientation.',
        'A blockchain-based credential verification system for student portfolios.',
        'A voice-controlled coding environment for developers with mobility impairments.',
        'A predictive campus bus tracker using historical delay data and weather.',
        'An open-source tool that automatically generates API documentation from code comments.',
        'A web scraper and aggregator for local hackathon and tech event listings.',
        'A Discord bot that helps student organizations manage RSVPs, events, and announcements.',
        'A machine learning model that detects plagiarism in code submissions for CS courses.',
        'A peer-to-peer tutoring marketplace for Kent State students.',
        'An IoT device that monitors air quality in dorm rooms and sends alerts.',
        'A sentiment analysis dashboard for university subreddits and social media.',
        '',
    ];
    return pick(ideas);
}

// ---- Registration phases ----
interface Phase {
    start: Date;
    end: Date;
    count: number;
    submitRate: number;
    approveRate: number; // of submitted
}

const phases: Phase[] = [
    { start: new Date('2026-04-24'), end: new Date('2026-07-31'), count: 28,  submitRate: 0.90, approveRate: 0.85 },
    { start: new Date('2026-08-01'), end: new Date('2026-10-31'), count: 52,  submitRate: 0.82, approveRate: 0.78 },
    { start: new Date('2026-11-01'), end: new Date('2027-01-15'), count: 88,  submitRate: 0.70, approveRate: 0.65 },
    { start: new Date('2027-01-16'), end: new Date('2027-02-28'), count: 55,  submitRate: 0.50, approveRate: 0.48 },
    { start: new Date('2027-03-01'), end: new Date('2027-03-05'), count: 27,  submitRate: 0.25, approveRate: 0.15 },
];
// Total: 250

// Track used emails to avoid collisions
const usedEmails = new Set<string>();

function genEmail(firstName: string, lastName: string, domain: string): string {
    const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    let email = `${base}@${domain}`;
    let i = 2;
    while (usedEmails.has(email)) {
        email = `${base}${i}@${domain}`;
        i++;
    }
    usedEmails.add(email);
    return email;
}

async function main() {
    console.log('Seeding metadata...');

    // --- Tracks ---
    const tracks = [
        { name: 'General', description: 'General track for all projects' },
        { name: 'Business Analytics', description: 'Data driven business solutions' },
        { name: 'Education Tech', description: 'Improving education through technology' },
        { name: 'Healthcare', description: 'Health and wellness solutions' },
        { name: 'Consumer', description: 'Consumer facing products' },
        { name: 'New Frontiers', description: 'Experimental and cutting edge tech' },
    ];
    for (const t of tracks) {
        await prisma.track.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // --- Criteria ---
    const criteria = [
        { slug: 'creativity',  name: 'Creativity',    order: 1, maxScore: 5 },
        { slug: 'mostLearned', name: 'Most Learned',  order: 2, maxScore: 5 },
        { slug: 'technicality',name: 'Technicality',  order: 3, maxScore: 5 },
        { slug: 'overall',     name: 'Overall Score', order: 4, maxScore: 5 },
        { slug: 'trackFit',    name: 'Track Fit',     order: 5, maxScore: 5 },
    ];
    for (const c of criteria) {
        await prisma.judgingCriterion.upsert({ where: { slug: c.slug }, update: {}, create: c });
    }

    console.log('Tracks & criteria seeded. Seeding applicants...');

    // Ensure resumes dir exists
    if (!existsSync('./resumes')) mkdirSync('./resumes', { recursive: true });

    let totalCreated = 0;

    for (const phase of phases) {
        for (let i = 0; i < phase.count; i++) {
            const isFemale = maybe(0.42);
            const firstName = isFemale ? pick(firstNamesFemale) : pick(firstNamesMale);
            const lastName = pick(lastNames);
            const school = pickWeightedSchool();
            const email = genEmail(firstName, lastName, school.domain);

            // Scatter registration date across the phase, with slight end-weighting
            const regDate = randDate(phase.start, phase.end);

            const userId = randomUUID();
            const appId = randomUUID();

            const isSubmitted = maybe(phase.submitRate);
            const submittedAt = isSubmitted
                ? randDate(addDays(regDate, 1), addDays(regDate, rand(3, 21)))
                : null;

            const isApproved = isSubmitted && submittedAt !== null && maybe(phase.approveRate);
            const approvedAt = isApproved && submittedAt
                ? randDate(addDays(submittedAt, 1), addDays(submittedAt, rand(2, 14)))
                : null;

            const interests = Array.from(
                new Set(Array.from({ length: rand(2, 5) }, () => pick(interestPool)))
            ).join(', ');

            const gender = pick(genders);
            const pronouns = gender === 'Male' ? 'He/Him'
                : gender === 'Female' ? 'She/Her'
                : pick(pronounsPool);

            const hasResume = isSubmitted && maybe(0.62);
            const hasGithub = maybe(0.78);

            const githubUrl = hasGithub ? genGithubUrl(firstName, lastName) : '';

            // Create user
            await prisma.user.create({
                data: {
                    id: userId,
                    name: `${firstName} ${lastName}`,
                    email,
                    emailVerified: true,
                    createdAt: regDate,
                    updatedAt: regDate,
                },
            });

            // Create application
            await prisma.application.create({
                data: {
                    id: appId,
                    userId,
                    firstName,
                    lastName,
                    age: rand(18, 26),
                    phoneNumber: `(${rand(200,999)}) ${rand(200,999)}-${rand(1000,9999)}`,
                    email,
                    countryOfResidence: pick(countries),
                    school: school.name,
                    levelOfStudy: pick(levelsOfStudy),
                    fieldOfStudy: pick(fieldsOfStudy),
                    githubUrl,
                    personalUrl: maybe(0.3) ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : '',
                    projectIdea: isSubmitted ? genProjectIdea() : '',
                    gender,
                    pronouns,
                    dietaryRestriction: pick(dietaryRestrictions),
                    raceEthnicity: pick(raceEthnicities),
                    sexuality: pick(sexualities),
                    firstGenStudent: maybe(0.28) ? 'Yes' : 'No',
                    hackatonsAttended: pick(hackatonsPool),
                    experienceLevel: pick(experienceLevels),
                    areasOfInterest: interests,
                    heardAboutUs: pick(heardAboutUsPool),
                    linkedinUrl: maybe(0.45) ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${rand(10,999)}` : '',
                    interestedInSponsors: pick(sponsorInterest),
                    teamPreference: pick(teamPrefs),
                    tshirtSize: pick(tshirtSizes),
                    mlhCodeOfConduct: isSubmitted,
                    mlhAuthorization: isSubmitted,
                    mlhEmails: isSubmitted && maybe(0.65),
                    submitted: isSubmitted,
                    submittedAt,
                    approved: isApproved,
                    approvedAt,
                    checkedIn: false,
                    updatedAt: submittedAt ?? regDate,
                },
            });

            // Write mock PDF for applicants with resumes
            if (hasResume) {
                writeFileSync(`./resumes/${appId}.pdf`, EMPTY_PDF);
            }

            totalCreated++;
        }
    }

    console.log(`Done! Created ${totalCreated} applicants.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
