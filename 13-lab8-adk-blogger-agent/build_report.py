"""Builds Lab8_Anthony_Bayate.pdf from the screenshots/ folder.

Run:  python build_report.py
"""
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (Image, KeepTogether, ListFlowable, PageBreak,
                                Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

HERE = Path(__file__).parent
SHOTS = HERE / "screenshots"
OUT = HERE / "Lab8_Anthony_Bayate.pdf"

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontSize=17, spaceAfter=6)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontSize=13, spaceBefore=8, spaceAfter=4)
BODY = ParagraphStyle("Body", parent=ss["BodyText"], fontSize=10, leading=13.5)
CELL = ParagraphStyle("Cell", parent=BODY, fontSize=9, leading=11.5)
CAP = ParagraphStyle("Cap", parent=BODY, fontSize=8.5, textColor=colors.grey, alignment=TA_CENTER)
TITLE = ParagraphStyle("Title", parent=ss["Title"], fontSize=22)

MAX_W = 7.0 * inch


def shot(name, caption, max_h=4.3 * inch):
    path = next(SHOTS.glob(f"{name}.*"))
    w, h = PILImage.open(path).size
    scale = min(MAX_W / w, max_h / h)
    return KeepTogether([Image(str(path), w * scale, h * scale), Paragraph(caption, CAP), Spacer(1, 8)])


def bullets(items):
    return ListFlowable([Paragraph(i, BODY) for i in items], bulletType="bullet", leftIndent=14)


ROLES = [
    ("Blogger (root <i>Agent</i>)", "Conductor",
     "Reads the user's topic, calls <i>planner_tool</i>, then <i>writer_tool</i>, then adds 3 alternate titles "
     "and 2 tweet-length hooks."),
    ("RobustBlogPlanner (<i>LoopAgent</i>, max 3)", "Planner",
     "Runs BlogPlanner (writes <i>blog_outline</i>), then OutlineValidationChecker (writes "
     "<i>validation_result</i>), then StopIfOutlineOk."),
    ("RobustBlogWriter (<i>LoopAgent</i>, max 3)", "Writer",
     "Runs BlogWriter (reads <i>blog_outline</i>, writes <i>blog_post</i>), then BlogPostValidationChecker, "
     "then StopIfPostOk."),
    ("AgentTool wrappers", "Glue",
     "<i>agent_tool.AgentTool(agent=...)</i> turns each loop into a function the root model can call, "
     "the same way it would call any other tool."),
]


def roles_table():
    rows = [[Paragraph("<b>Agent</b>", CELL), Paragraph("<b>Role</b>", CELL), Paragraph("<b>What it does</b>", CELL)]]
    rows += [[Paragraph(a, CELL), Paragraph(r, CELL), Paragraph(d, CELL)] for a, r, d in ROLES]
    t = Table(rows, colWidths=[2.0 * inch, 0.8 * inch, 4.2 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef7")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b0b8c4")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def build():
    s = [
        Paragraph("Lab #8: AI Agentic Lab", TITLE),
        Paragraph("Simple Blogger Agent with Google's Agent Development Kit (ADK)", CAP),
        Paragraph("Anthony Bayate &nbsp;|&nbsp; Web Client-Side Programming &nbsp;|&nbsp; Kean University, Fall 2026", CAP),
        Spacer(1, 14),

        Paragraph("Summary: how the agentic lab works", H1),
        Paragraph(
            "The lab follows the YouTube tutorial and builds a small multi-agent system that turns a one-line topic "
            "into a finished technical blog post. Instead of one big prompt, the job is split between agents with "
            "narrow jobs, and each draft is checked before it moves on. Everything runs on Gemini through Google's "
            "ADK, and <i>adk web</i> gives a browser UI that shows every agent call, the shared state, and a timing "
            "trace.", BODY),
        Spacer(1, 6),
        roles_table(),
        Spacer(1, 8),
        Paragraph("A request flows like this:", BODY),
        bullets([
            "The user types a topic. The root <b>Blogger</b> agent doesn't write anything itself. Its instruction "
            "tells it to call the planner tool and then the writer tool.",
            "<b>Planning loop.</b> BlogPlanner returns a Markdown outline (title, intro, 4-6 sections, conclusion) "
            "and ADK saves it in session state under <i>blog_outline</i> because of <i>output_key</i>. "
            "OutlineValidationChecker reads that state and answers \"ok\" or \"retry\" plus what is missing. If the "
            "answer is \"retry\", the LoopAgent runs the planner again, up to 3 times.",
            "<b>Writing loop.</b> BlogWriter turns <i>blog_outline</i> into a full article for software engineers "
            "(<i>blog_post</i>). BlogPostValidationChecker checks it for an intro, sections that match the outline, "
            "a conclusion, and technical clarity, with the same ok/retry loop.",
            "<b>Finish.</b> Control returns to Blogger, which shows the article and adds 3 alternate titles and "
            "2 tweet-length hooks.",
        ]),
        Spacer(1, 6),
        Paragraph(
            "What makes it \"agentic\" rather than one prompt: the root model decides which tool to call and when; "
            "the agents talk to each other through shared session state instead of passing long text around; and "
            "the checker agents make a feedback loop, so the system can catch and fix its own weak output. My run "
            "shows this. Asking for the \"top ten\" use cases made the planner write 10 sections, which breaks the "
            "checker's 4-6 section rule. The checker answered \"retry\", BlogPlanner ran again with fewer sections, "
            "the checker said \"ok\", and the loop stopped (see the Traces and loop-test screenshots).", BODY),

        Paragraph("Changes I made to the provided code", H2),
        bullets([
            "The <i>agent.py</i> in the zip used plain <i>sub_agents</i> on the root agent, which is not the design "
            "in the tutorial. I rebuilt it to match the slides: two <i>LoopAgent</i>s wrapped with "
            "<i>agent_tool.AgentTool</i> and passed to the root agent as <i>tools</i>.",
            "Added a tiny <i>StopIfOk</i> agent at the end of each loop. The slides never show how a loop stops "
            "after \"ok\", so without it every loop always runs all 3 times. StopIfOk reads "
            "<i>validation_result</i> and sends an <i>escalate</i> event, which is how ADK ends a LoopAgent early.",
            "Inserted <i>{blog_outline}</i> / <i>{blog_post}</i> into the checker and writer instructions so the "
            "state values are actually put into the prompt.",
        ]),
        Spacer(1, 10),

        Paragraph("Setup", H1),
        Paragraph(
            "I extracted <i>simple_blogger_agent_works.zip</i> into <i>week 8/lab8-blogger-agent</i>. The <i>.venv</i> "
            "inside the zip pointed to another person's Python install, so I made a new Python 3.12 virtual "
            "environment and installed <i>uv</i>, <i>google-adk</i> and <i>python-dotenv</i>, as in the tutorial's "
            "\"Environment setup\" slide.", BODY),
        Spacer(1, 6),
        shot("term_01_setup", "Creating the virtual environment and installing google-adk (ADK 2.12.0)."),
        shot("term_02_project", "Project layout and .env config (API key redacted). __init__.py exposes root_agent to ADK."),
        shot("term_05_code", "agent.py excerpt: the two LoopAgents, the StopIfOk exit step, and the AgentTool wrappers.",
             max_h=4.6 * inch),
        PageBreak(),

        Paragraph("Running and testing the agent", H1),
        shot("term_03_adk_web", "Starting the ADK web server (port 8765, since 8000 was in use) and the agent's calls to Gemini."),
        shot("01_adk_web_home", "ADK Dev UI with simple_blogger_agent loaded (telemetry prompt declined)."),
        PageBreak(),
        shot("02_events", "Prompt from the tutorial. Blogger calls RobustBlogPlanner, then RobustBlogWriter; "
             "each tool returns state (blog_outline, blog_post, validation_result)."),
        shot("04_trace_planner", "Traces tab: inside RobustBlogPlanner the outline checker did not return \"ok\" "
             "the first time, so the loop ran BlogPlanner again. State panel on the left shows blog_outline."),
        PageBreak(),
        shot("05_trace_writer", "Rest of the trace: the writer loop passed its check on the first try (StopIfPostOk "
             "ended the loop), then Blogger wrote the final answer. Total latency was about 21 seconds."),
        shot("03_final_output", "End of the generated post with the 3 alternate titles and 2 tweet-length hooks. "
             "The graph on the left is the same architecture as the tutorial diagram."),
        shot("term_06_loop", "loop_test.py runs RobustBlogPlanner by itself and prints the inner events: the checker "
             "says \"retry\" (10 sections, rule is 4-6), the planner tries again, the checker says \"ok\", and "
             "StopIfOutlineOk escalates to end the loop.", max_h=2.0 * inch),
        shot("term_04_cli_run", "A test without the browser: smoke_test.py runs the full root_agent with ADK's "
             "InMemoryRunner and prints each top-level event.", max_h=2.0 * inch),

        Paragraph("Problems I ran into", H2),
        bullets([
            "The Gemini API key in the zip returned <i>402 RESOURCE_EXHAUSTED</i> (prepaid credits used up), so I "
            "used my own Google AI Studio key.",
            "<i>gemini-flash-latest</i> returned <i>503 UNAVAILABLE</i> (high demand) at the time I tested, so I "
            "set <i>MODEL=gemini-flash-lite-latest</i> in .env. The code still defaults to the tutorial's model.",
            "Port 8000 was already used by another local app, so I ran <i>adk web --port 8765</i>.",
            "One design flaw I noticed: the outline checker always wants 4-6 sections, which clashes with a \"top "
            "ten\" request and causes an extra retry. The root agent still delivered ten items in the final post, "
            "but a better checker would take the user's request into account.",
        ]),
    ]
    SimpleDocTemplate(str(OUT), pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                      topMargin=0.7 * inch, bottomMargin=0.7 * inch,
                      title="Lab 8 - AI Agentic Lab - Anthony Bayate", author="Anthony Bayate").build(s)
    print(OUT)


if __name__ == "__main__":
    build()
