"""Generates the sample resume PDF used to test the Task 5 RAG pipeline.

This is a fictional candidate written specifically so the RAG app has something
real to find: clear strengths, and a few deliberate gaps (an employment gap, no
degree listed as completed, no testing experience) so the critical chain has
genuine material instead of having to invent weaknesses.

Run:  python make_sample_resume.py
"""

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

OUT = "sample-resume.pdf"

styles = getSampleStyleSheet()
name_style = ParagraphStyle(
    "name", parent=styles["Title"], fontSize=20, spaceAfter=2, alignment=TA_LEFT
)
contact_style = ParagraphStyle(
    "contact", parent=styles["Normal"], fontSize=9, textColor="#555555", spaceAfter=12
)
section_style = ParagraphStyle(
    "section",
    parent=styles["Heading2"],
    fontSize=11.5,
    spaceBefore=12,
    spaceAfter=4,
    textColor="#1a3d7c",
)
body_style = ParagraphStyle(
    "body", parent=styles["Normal"], fontSize=9.5, leading=13, spaceAfter=3
)

story = []


def section(title, paragraphs):
    story.append(Paragraph(title, section_style))
    for p in paragraphs:
        story.append(Paragraph(p, body_style))


story.append(Paragraph("Jordan M. Rivera", name_style))
story.append(
    Paragraph(
        "Newark, NJ &nbsp;|&nbsp; jordan.rivera.dev@example.com &nbsp;|&nbsp; "
        "(555) 014-2278 &nbsp;|&nbsp; github.com/example-jrivera",
        contact_style,
    )
)

section(
    "SUMMARY",
    [
        "Front-end leaning full-stack developer with 4 years of professional experience "
        "building customer-facing web applications in JavaScript and TypeScript. Strongest "
        "in React and Node.js. Comfortable owning a feature from API design through UI "
        "delivery. Looking for a mid-level product engineering role."
    ],
)

section(
    "TECHNICAL SKILLS",
    [
        "<b>Languages:</b> JavaScript (ES2022), TypeScript, HTML5, CSS3, SQL, some Python",
        "<b>Front end:</b> React, Redux Toolkit, Next.js, Tailwind CSS, Vite, responsive design",
        "<b>Back end:</b> Node.js, Express, REST API design, PostgreSQL, Prisma ORM",
        "<b>Tools:</b> Git, GitHub Actions, Figma, Postman, Jira, Vercel, Docker (basic)",
    ],
)

section(
    "PROFESSIONAL EXPERIENCE",
    [
        "<b>Front-End Developer &mdash; Brightpath Retail Group, Jersey City, NJ</b><br/>"
        "<i>March 2023 &ndash; Present</i>",
        "&bull; Rebuilt the product catalog page in Next.js, cutting largest contentful paint "
        "from 4.1s to 1.6s and lifting mobile conversion 12% quarter over quarter.",
        "&bull; Designed and shipped a shared component library used by 3 product teams, "
        "reducing duplicated UI code across the front-end monorepo by roughly 30%.",
        "&bull; Partnered with the design team to bring the checkout flow to WCAG 2.1 AA, "
        "resolving 40+ accessibility issues found in an external audit.",
        "&bull; Mentored two junior developers through their first six months, including "
        "weekly code review sessions.",
        "<br/><b>Junior Web Developer &mdash; Halden Digital Studio, Newark, NJ</b><br/>"
        "<i>June 2021 &ndash; August 2022</i>",
        "&bull; Built and maintained marketing sites for 9 small-business clients using "
        "React and headless WordPress.",
        "&bull; Automated the client deploy process with GitHub Actions, taking a manual "
        "45-minute release down to about 6 minutes.",
        "&bull; Wrote the Express endpoints backing a lead-capture form that handled roughly "
        "2,000 submissions per month.",
    ],
)

section(
    "PROJECTS",
    [
        "<b>TrailLog</b> &mdash; A hiking journal PWA. React + Node + PostgreSQL, offline "
        "support via service workers. About 300 monthly active users.",
        "<b>ChartKit</b> &mdash; An open-source React charting wrapper around D3. 140 GitHub "
        "stars; I review and merge community pull requests.",
    ],
)

section(
    "EDUCATION",
    [
        "<b>Kean University</b> &mdash; Coursework toward a B.S. in Computer Science, "
        "2019 &ndash; 2021. Completed 68 credits; left to take a full-time developer role. "
        "Degree not yet completed.",
        "Relevant coursework: Data Structures, Web Client-Side Programming, Database Systems.",
    ],
)

section(
    "CERTIFICATIONS",
    [
        "&bull; freeCodeCamp Responsive Web Design (2021)",
        "&bull; Meta Front-End Developer Professional Certificate (2022)",
    ],
)

SimpleDocTemplate(
    OUT,
    pagesize=LETTER,
    leftMargin=0.75 * inch,
    rightMargin=0.75 * inch,
    topMargin=0.7 * inch,
    bottomMargin=0.7 * inch,
    title="Jordan M. Rivera - Resume",
).build(story)

print("Wrote", OUT)
