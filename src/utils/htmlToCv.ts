import type {
  CvContact,
  CvDocument,
  CvEducation,
  CvExperience,
  CvProject,
  CvSkills,
} from "../types/cv";

function cleanText(
  value: string | null | undefined
): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function getText(
  element: Element | null
): string {
  return cleanText(element?.textContent);
}

function getSection(
  document: Document,
  title: string
): HTMLElement | null {
  const headings = Array.from(
    document.querySelectorAll("h2")
  );

  const heading = headings.find(
    (element) =>
      getText(element).toLowerCase() ===
      title.toLowerCase()
  );

  if (!heading) {
    return null;
  }

  const section = document.createElement("section");

  let current =
    heading.nextElementSibling;

  while (current) {
    if (
      current.tagName.toLowerCase() ===
      "h2"
    ) {
      break;
    }

    section.appendChild(
      current.cloneNode(true)
    );

    current = current.nextElementSibling;
  }

  return section;
}

function parseContact(
  document: Document
): CvContact {
  const contact: CvContact = {};

  const links = Array.from(
    document.querySelectorAll("a")
  );

  for (const link of links) {
    const href =
      link.getAttribute("href") ?? "";

    const text = getText(link);

    if (
      href.startsWith("mailto:")
    ) {
      contact.email = href.replace(
        "mailto:",
        ""
      );
    }

    if (
      href.includes("linkedin.com")
    ) {
      contact.linkedin = href;
    }

    if (
      href.includes("github.com")
    ) {
      contact.github = href;
    }

    if (
      !contact.portfolio &&
      href.startsWith("http") &&
      !href.includes("linkedin.com") &&
      !href.includes("github.com")
    ) {
      contact.portfolio = href;
    }

    if (
      !contact.email &&
      text.includes("@")
    ) {
      contact.email = text;
    }
  }

  const bodyText =
    document.body.textContent ?? "";

  const phoneMatch =
    bodyText.match(
      /(?:\+91[\s-]?)?[6-9]\d{9}/
    );

  if (phoneMatch) {
    contact.phone = phoneMatch[0];
  }

  return contact;
}

function parseSkills(
  section: HTMLElement | null
): CvSkills {
  const skills: CvSkills = {};

  if (!section) {
    return skills;
  }

  const paragraphs =
    Array.from(
      section.querySelectorAll("p")
    );

  for (const paragraph of paragraphs) {
    const text = getText(paragraph);

    const separator =
      text.indexOf(":");

    if (separator === -1) {
      continue;
    }

    const label = cleanText(
      text.slice(0, separator)
    ).toLowerCase();

    const values = text
      .slice(separator + 1)
      .split(",")
      .map(cleanText)
      .filter(Boolean);

    if (!values.length) {
      continue;
    }

    if (
      label.includes("language")
    ) {
      skills.languages = values;
    } else if (
      label.includes("frontend") ||
      label.includes("front-end")
    ) {
      skills.frontend = values;
    } else if (
      label.includes("backend") ||
      label.includes("back-end")
    ) {
      skills.backend = values;
    } else if (
      label.includes("database")
    ) {
      skills.databases = values;
    } else if (
      label.includes("cloud")
    ) {
      skills.cloud = values;
    } else if (
      label.includes("tool")
    ) {
      skills.tools = values;
    }
  }

  return skills;
}

function parseExperience(
  section: HTMLElement | null
): CvExperience[] {
  if (!section) {
    return [];
  }

  const experiences: CvExperience[] = [];

  const jobs =
    Array.from(
      section.querySelectorAll(".job")
    );

  for (const job of jobs) {
    const title =
      getText(
        job.querySelector("h3")
      );

    const company =
      getText(
        job.querySelector(
          ".company"
        )
      );

    const date =
      getText(
        job.querySelector(
          ".job-date"
        )
      );

    const location =
      getText(
        job.querySelector(
          ".location"
        )
      );

    const bullets =
      Array.from(
        job.querySelectorAll("li")
      )
        .map(getText)
        .filter(Boolean);

    const [startDate, endDate] =
      date
        .split("–")
        .map(cleanText);

    if (
      title ||
      company ||
      bullets.length
    ) {
      experiences.push({
        title,
        company,
        location:
          location || undefined,
        startDate:
          startDate || undefined,
        endDate:
          endDate || undefined,
        bullets,
      });
    }
  }

  return experiences;
}

function parseProjects(
  section: HTMLElement | null
): CvProject[] {
  if (!section) {
    return [];
  }

  const projects: CvProject[] = [];

  const headings =
    Array.from(
      section.querySelectorAll("h3")
    );

  for (const heading of headings) {
    const name = getText(heading);

    let description = "";
    let technologies: string[] = [];

    let current =
      heading.nextElementSibling;

    while (
      current &&
      current.tagName.toLowerCase() !==
        "h3"
    ) {
      if (
        current.tagName.toLowerCase() ===
        "p"
      ) {
        const text = getText(current);

        if (
          text
            .toLowerCase()
            .startsWith("technologies:")
        ) {
          technologies = text
            .replace(
              /^technologies:\s*/i,
              ""
            )
            .split(",")
            .map(cleanText)
            .filter(Boolean);
        } else if (!description) {
          description = text;
        }
      }

      current =
        current.nextElementSibling;
    }

    projects.push({
      name,
      description,
      technologies,
    });
  }

  return projects;
}

function parseEducation(
  section: HTMLElement | null
): CvEducation[] {
  if (!section) {
    return [];
  }

  const education: CvEducation[] = [];

  const headings =
    Array.from(
      section.querySelectorAll("h3")
    );

  for (const heading of headings) {
    const degree = getText(heading);

    let institution = "";
    let grade = "";
    let startDate = "";
    let endDate = "";

    let current =
      heading.nextElementSibling;

    while (
      current &&
      current.tagName.toLowerCase() !==
        "h3"
    ) {
      const text = getText(current);

      if (
        text
          .toLowerCase()
          .startsWith("grade:")
      ) {
        grade = text.replace(
          /^grade:\s*/i,
          ""
        );
      } else if (!institution) {
        institution = text;
      }

      current =
        current.nextElementSibling;
    }

    education.push({
      degree,
      institution,
      startDate:
        startDate || undefined,
      endDate:
        endDate || undefined,
      grade:
        grade || undefined,
    });
  }

  return education;
}

export function htmlToCv(
  html: string
): CvDocument {
  const parser =
    new DOMParser();

  const document =
    parser.parseFromString(
      html,
      "text/html"
    );

  const name =
    getText(
      document.querySelector("h1")
    ) || "Untitled Resume";

  const allParagraphs =
    Array.from(
      document.querySelectorAll("p")
    );

  const headline =
    allParagraphs.length > 0
      ? getText(allParagraphs[0])
      : undefined;

  const summarySection =
    getSection(
      document,
      "Summary"
    ) ??
    getSection(
      document,
      "Professional Summary"
    );

  const summary =
    summarySection
      ? getText(
          summarySection.querySelector(
            "p"
          )
        )
      : undefined;

  const skillsSection =
    getSection(
      document,
      "Skills"
    ) ??
    getSection(
      document,
      "Technical Skills"
    );

  const experienceSection =
    getSection(
      document,
      "Experience"
    );

  const projectsSection =
    getSection(
      document,
      "Projects"
    );

  const educationSection =
    getSection(
      document,
      "Education"
    );

  return {
    name,

    headline,

    contact:
      parseContact(document),

    summary,

    skills:
      parseSkills(
        skillsSection
      ),

    experience:
      parseExperience(
        experienceSection
      ),

    projects:
      parseProjects(
        projectsSection
      ),

    education:
      parseEducation(
        educationSection
      ),
  };
}