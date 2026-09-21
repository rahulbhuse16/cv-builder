import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { CvDocument } from "../types/cv";

interface PdfResumeProps {
  cv: CvDocument;
}

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 42,
    paddingRight: 42,

    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.35,

    color: "#111111",
    backgroundColor: "#ffffff",
  },

  name: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 3,
  },

  headline: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },

  contact: {
    fontSize: 8.5,
    marginBottom: 9,
    color: "#222222",
  },

  contactLink: {
    color: "#111111",
    textDecoration: "none",
  },

  section: {
    marginTop: 7,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",

    borderBottomWidth: 0.8,
    borderBottomColor: "#111111",

    paddingBottom: 2,
    marginBottom: 5,
  },

  summary: {
    fontSize: 9,
    lineHeight: 1.35,
  },

  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
  },

  skillLabel: {
    width: 85,
    fontWeight: 700,
  },

  skillValue: {
    flex: 1,
  },

  experience: {
    marginBottom: 7,
  },

  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },

  experienceTitle: {
    fontSize: 9.2,
    fontWeight: 700,
    flex: 1,
  },

  experienceDate: {
    fontSize: 8.5,
    textAlign: "right",
    marginLeft: 10,
    flexShrink: 0,
  },

  company: {
    fontSize: 8.8,
    fontWeight: 700,
    marginBottom: 2,
  },

  location: {
    fontSize: 8.2,
    marginBottom: 2,
  },

  bulletList: {
    marginTop: 2,
  },

  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
  },

  bulletSymbol: {
    width: 9,
    fontSize: 8,
  },

  bulletText: {
    flex: 1,
    fontSize: 8.7,
    lineHeight: 1.32,
  },

  project: {
    marginBottom: 6,
  },

  projectName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
  },

  projectDescription: {
    fontSize: 8.7,
    lineHeight: 1.32,
  },

  technologies: {
    fontSize: 8.2,
    marginTop: 1,
  },

  education: {
    marginBottom: 5,
  },

  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  degree: {
    fontSize: 9,
    fontWeight: 700,
    flex: 1,
  },

  educationDate: {
    fontSize: 8.3,
    marginLeft: 10,
  },

  institution: {
    fontSize: 8.5,
    marginTop: 1,
  },

  grade: {
    fontSize: 8.3,
    marginTop: 1,
  },
});

function ContactLine({ cv }: PdfResumeProps) {
  const { contact } = cv;

  const items: React.ReactNode[] = [];

  if (contact.email) {
    items.push(
      <Link
        key="email"
        src={`mailto:${contact.email}`}
        style={styles.contactLink}
      >
        {contact.email}
      </Link>
    );
  }

  if (contact.phone) {
    items.push(
      <Text key="phone">
        {contact.phone}
      </Text>
    );
  }

  if (contact.location) {
    items.push(
      <Text key="location">
        {contact.location}
      </Text>
    );
  }

  if (contact.linkedin) {
    items.push(
      <Link
        key="linkedin"
        src={contact.linkedin}
        style={styles.contactLink}
      >
        LinkedIn
      </Link>
    );
  }

  if (contact.github) {
    items.push(
      <Link
        key="github"
        src={contact.github}
        style={styles.contactLink}
      >
        GitHub
      </Link>
    );
  }

  if (contact.portfolio) {
    items.push(
      <Link
        key="portfolio"
        src={contact.portfolio}
        style={styles.contactLink}
      >
        Portfolio
      </Link>
    );
  }

  return (
    <View style={styles.contact}>
      {items.map((item, index) => (
        <Text key={index}>
          {index > 0 ? "  |  " : ""}
          {item}
        </Text>
      ))}
    </View>
  );
}

function SkillsSection({
  skills,
}: {
  skills: CvDocument["skills"];
}) {
  if (!skills) {
    return null;
  }

  const rows = [
    ["Languages", skills.languages],
    ["Frontend", skills.frontend],
    ["Backend", skills.backend],
    ["Databases", skills.databases],
    ["Cloud", skills.cloud],
    ["Tools", skills.tools],
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Technical Skills
      </Text>

      {rows.map(([label, values]) => {
        if (!values || values.length === 0) {
          return null;
        }

        return (
          <View
            key={String(label)}
            style={styles.skillRow}
          >
            <Text style={styles.skillLabel}>
              {label}:
            </Text>

            <Text style={styles.skillValue}>
              {(values as string[]).join(", ")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ExperienceSection({
  experience,
}: {
  experience: CvDocument["experience"];
}) {
  if (!experience.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Experience
      </Text>

      {experience.map((job, index) => (
        <View
          key={`${job.company}-${index}`}
          style={styles.experience}
          wrap={false}
        >
          <View style={styles.experienceHeader}>
            <Text style={styles.experienceTitle}>
              {job.title}
            </Text>

            {(job.startDate || job.endDate) && (
              <Text style={styles.experienceDate}>
                {job.startDate}
                {job.startDate && job.endDate
                  ? " – "
                  : ""}
                {job.endDate}
              </Text>
            )}
          </View>

          <Text style={styles.company}>
            {job.company}
          </Text>

          {job.location && (
            <Text style={styles.location}>
              {job.location}
            </Text>
          )}

          <View style={styles.bulletList}>
            {job.bullets.map((bullet, bulletIndex) => (
              <View
                key={bulletIndex}
                style={styles.bullet}
              >
                <Text style={styles.bulletSymbol}>
                  •
                </Text>

                <Text style={styles.bulletText}>
                  {bullet}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ProjectsSection({
  projects,
}: {
  projects: CvDocument["projects"];
}) {
  if (!projects?.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Projects
      </Text>

      {projects.map((project, index) => (
        <View
          key={`${project.name}-${index}`}
          style={styles.project}
        >
          <Text style={styles.projectName}>
            {project.name}
          </Text>

          <Text style={styles.projectDescription}>
            {project.description}
          </Text>

          {project.technologies?.length ? (
            <Text style={styles.technologies}>
              <Text style={{ fontWeight: 700 }}>
                Technologies:
              </Text>{" "}
              {project.technologies.join(", ")}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function EducationSection({
  education,
}: {
  education: CvDocument["education"];
}) {
  if (!education.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Education
      </Text>

      {education.map((item, index) => (
        <View
          key={`${item.institution}-${index}`}
          style={styles.education}
          wrap={false}
        >
          <View style={styles.educationHeader}>
            <Text style={styles.degree}>
              {item.degree}
            </Text>

            {(item.startDate || item.endDate) && (
              <Text style={styles.educationDate}>
                {item.startDate}
                {item.startDate && item.endDate
                  ? " – "
                  : ""}
                {item.endDate}
              </Text>
            )}
          </View>

          <Text style={styles.institution}>
            {item.institution}
          </Text>

          {item.grade && (
            <Text style={styles.grade}>
              {item.grade}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function PdfResume({
  cv,
}: PdfResumeProps) {
  return (
    <Document
      title={`${cv.name} Resume`}
      author={cv.name}
      subject="ATS Friendly Resume"
      creator="ATS CV Builder"
    >
      <Page
        size="A4"
        style={styles.page}
      >
        <Text style={styles.name}>
          {cv.name}
        </Text>

        {cv.headline && (
          <Text style={styles.headline}>
            {cv.headline}
          </Text>
        )}

        <ContactLine cv={cv} />

        {cv.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Professional Summary
            </Text>

            <Text style={styles.summary}>
              {cv.summary}
            </Text>
          </View>
        )}

        <SkillsSection skills={cv.skills} />

        <ExperienceSection
          experience={cv.experience}
        />

        <ProjectsSection
          projects={cv.projects}
        />

        <EducationSection
          education={cv.education}
        />
      </Page>
    </Document>
  );
}