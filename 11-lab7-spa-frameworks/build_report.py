"""Builds Lab7_Anthony_Bayate.pdf from the screenshots/ folder.

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
                                Paragraph, SimpleDocTemplate, Spacer)

HERE = Path(__file__).parent
SHOTS = HERE / "screenshots"
OUT = HERE / "Lab7_Anthony_Bayate.pdf"

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontSize=17, spaceAfter=6)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontSize=13, spaceBefore=8, spaceAfter=4)
BODY = ParagraphStyle("Body", parent=ss["BodyText"], fontSize=10, leading=13.5)
CAP = ParagraphStyle("Cap", parent=BODY, fontSize=8.5, textColor=colors.grey, alignment=TA_CENTER)
TITLE = ParagraphStyle("Title", parent=ss["Title"], fontSize=22)

MAX_W = 7.0 * inch


def shot(name, caption, max_h=4.3 * inch):
    path = SHOTS / f"{name}.png"
    w, h = PILImage.open(path).size
    scale = min(MAX_W / w, max_h / h)
    return KeepTogether([Image(str(path), w * scale, h * scale), Paragraph(caption, CAP), Spacer(1, 8)])


def bullets(items):
    return ListFlowable([Paragraph(i, BODY) for i in items], bulletType="bullet", leftIndent=14)


TASKS = [
    {
        "n": 1, "key": "vanilla", "name": "Vanilla JavaScript", "port": 5101,
        "app": "TV Show Finder (TVMaze API)",
        "discuss": (
            "The starter waits for <i>DOMContentLoaded</i>, fetches <i>/shows</i> from TVMaze, and appends one "
            "Materialize card per show with <i>innerHTML +=</i>. Discussing it with an LLM pointed out four "
            "problems: the loading bar and error div were never used; <i>movie.image.medium</i> crashes when a "
            "show has no image; the summary is raw HTML from a third party, injected straight into the page; and "
            "<i>innerHTML +=</i> inside a loop re-parses the whole container every iteration."),
        "changes": [
            "Search form that calls TVMaze's <i>/search/shows?q=</i> endpoint (results are unwrapped from <i>{score, show}</i>).",
            "Loading bar and error panel are shown/hidden in <i>try/catch/finally</i>; non-200 responses throw.",
            "Summaries are stripped to plain text with <i>DOMParser</i>, and names are escaped before rendering.",
            "Placeholder image when <i>image</i> is null, lazy-loaded images, rating badge, genre chips, premiere year.",
            "All cards are built with <i>map().join()</i> and written to the DOM once.",
        ],
    },
    {
        "n": 2, "key": "vue", "name": "Vue 3", "port": 5102,
        "app": "Album Explorer (iTunes Search API)",
        "discuss": (
            "The component uses the Composition API: <i>ref()</i> for albums, error and loading, and "
            "<i>onMounted</i> to fetch once. <i>v-if / v-else-if / v-else</i> switch between error, spinner and "
            "grid, and <i>v-for</i> with <i>:key</i> renders the cards. The LLM noted the search term was "
            "hard-coded, the 100x100 artwork looks blurry when stretched, and the response status was never checked."),
        "changes": [
            "Search box bound with <i>v-model</i>; submitting the form re-runs the fetch with the new artist.",
            "A <i>computed()</i> sorted list (relevance / newest / oldest / most tracks) so sorting never re-hits the API.",
            "Artwork URL rewritten from 100x100 to 400x400 for sharp images.",
            "Release year, track count and price on each card; empty-result message; HTTP errors are surfaced.",
        ],
    },
    {
        "n": 3, "key": "preact", "name": "Preact", "port": 5103,
        "app": "Met Gallery (Metropolitan Museum Collection API)",
        "discuss": (
            "Preact uses the same hooks API as React (<i>useState</i>, <i>useEffect</i>) in a 3 kB runtime. "
            "The starter searches the Met for object IDs, fetches each object in parallel with "
            "<i>Promise.all</i>, and keeps the ones with images. <b>Error found:</b> the Met retired "
            "<i>/public/collection/v1/search</i> on 2026-10-01 (HTTP 410), so the original code shows "
            "&quot;Error fetching data&quot;. The replacement is the paginated <i>/v1.1/search</i> endpoint."),
        "changes": [
            "Switched to <i>/v1.1/search?...&amp;limit=40</i> (no more downloading every matching ID).",
            "<i>Promise.allSettled</i> so one failed object request doesn't break the whole gallery.",
            "Topic buttons (painting, sunflowers, samurai, egypt, ...) that re-run the effect via its <i>[query]</i> dependency.",
            "Loading indicator, empty state, and extra fields (date, department).",
        ],
    },
    {
        "n": 4, "key": "lit", "name": "Lit (Web Components)", "port": 5104,
        "app": "Fashion Finds (custom element &lt;gif-list&gt;)",
        "discuss": (
            "Lit defines a real browser custom element: <i>static styles</i> are scoped by the Shadow DOM, "
            "<i>static properties</i> are reactive, and assigning <i>this.items</i> triggers <i>render()</i>. "
            "<b>Error found:</b> the Tenor v1 API now returns <i>403 &quot;Tenor API is discontinued&quot;</i>, "
            "so the starter renders an empty list. The <i>node-fetch</i> install is also unnecessary because "
            "browsers have <i>fetch</i> built in."),
        "changes": [
            "Data source replaced with DummyJSON's free, keyless fashion product categories (dresses, tops, shirts, shoes, sunglasses).",
            "Category pill buttons using <i>@click</i> and <i>aria-pressed</i>; the component re-fetches on change.",
            "New reactive <i>owner</i> attribute, so the name is passed in from HTML: <i>&lt;gif-list owner=\"Anthony Bayate\"&gt;</i>.",
            "Loading and error states, price and rating, hover lift, and a single-column layout on small screens.",
        ],
    },
    {
        "n": 5, "key": "svelte", "name": "Svelte 5", "port": 5105,
        "app": "NEO Watch (NASA NeoWs API)",
        "discuss": (
            "Svelte compiles components to plain JavaScript with no virtual DOM. <b>Error found:</b> the lab's "
            "<i>main.js</i> uses <i>new App({ target })</i>, which is Svelte 3/4 syntax; Vite now installs "
            "Svelte 5, where components are no longer classes and must be started with "
            "<i>mount(App, { target })</i>. I kept the template's <i>mount()</i> entry point and moved the "
            "component to Svelte 5 runes."),
        "changes": [
            "<i>$state</i> for reactive values and <i>$derived.by</i> for the filtered/sorted list.",
            "&quot;Potentially hazardous only&quot; checkbox and sort-by-size/name dropdown with <i>bind:</i>.",
            "Keyed <i>{#each ... (asteroid.id)}</i>, rounded diameters, a size bar, and red/green hazard markers.",
            "Error message when NASA's DEMO_KEY is rate-limited, plus a link to each object's JPL page.",
        ],
    },
    {
        "n": 6, "key": "solid", "name": "SolidJS", "port": 5106,
        "app": "Toon Shelf (Sample APIs cartoons)",
        "discuss": (
            "Solid looks like React but its components run only once; <i>createSignal</i> values are functions "
            "(<i>cartoons()</i>) and only the exact DOM nodes that read a signal update. The LLM pointed out "
            "that the starter's <i>.map()</i> with a <i>key</i> prop is a React habit: Solid ignores <i>key</i> "
            "and recommends <i>&lt;For&gt;</i>. Also, <i>creator</i> is an array, so it printed run together."),
        "changes": [
            "<i>&lt;For&gt;</i> and <i>&lt;Show&gt;</i> control-flow components instead of <i>.map()</i> and <i>&amp;&amp;</i>.",
            "Live title filter using a <i>createMemo</i> derived from the search signal.",
            "Creators joined with commas, genre chips, episode count and TV rating.",
            "<i>onError</i> fallback: several image hosts block hot-linking, so those cards show a titled placeholder.",
        ],
    },
    {
        "n": 7, "key": "qwik", "name": "Qwik", "port": 5107,
        "app": "Qwik Movies (TVMaze API, Qwik City)",
        "discuss": (
            "Qwik is no longer in the <i>create-vite</i> menu, so the project was created with "
            "<i>npm create qwik@latest empty qwik</i>. Running the lab code as-is crashes the dev server "
            "(screenshot below). The LLM and the TypeScript compiler identified two errors: "
            "<i>useClientEffect$</i> no longer exists in Qwik (renamed to <i>useVisibleTask$</i>), and "
            "<i>innerHTML</i> is not a valid JSX prop (Qwik uses <i>dangerouslySetInnerHTML</i>). A third, "
            "latent bug: shows with <i>image: null</i> would crash <i>movie.image.medium</i>."),
        "changes": [
            "Data loading moved to <i>routeLoader$</i>, which runs on the server, so the HTML arrives already "
            "filled in. This is Qwik's resumability idea: no client-side fetch and no hydration.",
            "<i>dangerouslySetInnerHTML</i> for the summary; optional chaining plus a placeholder for missing images.",
            "Client-side filter with <i>useSignal</i> + <i>useComputed$</i>; that code is only downloaded when used.",
            "Rating badges, genres, and a <i>head</i> export that sets the page title. <i>tsc --noEmit</i> passes.",
        ],
    },
]


def build():
    story = [
        Paragraph("Lab #7: Meet the SPA's JS Frameworks", TITLE),
        Paragraph("<b>Anthony Bayate</b> &nbsp;|&nbsp; Web Client-Side Programming &nbsp;|&nbsp; Kean University &nbsp;|&nbsp; October 2026", ParagraphStyle("c", parent=BODY, alignment=TA_CENTER)),
        Spacer(1, 14),
        Paragraph("Setup", H2),
        Paragraph(
            "Each framework was scaffolded with <i>npm create vite@latest &lt;name&gt; -- --template &lt;framework&gt;</i> "
            "(Vite 8, JavaScript variants), followed by <i>npm install</i> and <i>npm run dev</i>. Vue and Preact also "
            "got <i>npm install materialize-css</i>; the others load Materialize from the CDN via <i>@import</i>. "
            "React was skipped as the handout says. For every framework there are three screenshots: the default "
            "template, the template with my name added, and the finished customized app.", BODY),
        Spacer(1, 6),
        Paragraph("Problems found while running the handout code", H2),
        bullets([
            "<b>Preact:</b> the Met's <i>/v1/search</i> endpoint was retired on 2026-10-01 (HTTP 410); moved to <i>/v1.1/search</i>.",
            "<b>Lit:</b> the Tenor GIF API is discontinued (HTTP 403); replaced with DummyJSON fashion products.",
            "<b>Svelte:</b> <i>new App()</i> does not work in Svelte 5; <i>mount()</i> is required.",
            "<b>Qwik:</b> not offered by create-vite any more; <i>useClientEffect$</i> and the <i>innerHTML</i> prop no longer exist.",
        ]),
    ]

    for t in TASKS:
        n, key = t["n"], t["key"]
        story += [
            PageBreak(),
            Paragraph(f"Task #{n}. {t['name']}: {t['app']}", H1),
            Paragraph(f"Project folder: <i>{key}/</i> &nbsp;&nbsp; Dev server: <i>http://localhost:{t['port']}/</i>", BODY),
            Paragraph("Code discussion (with LLM help)", H2),
            Paragraph(t["discuss"], BODY),
            Paragraph("Customizations and improvements", H2),
            bullets(t["changes"]),
            Spacer(1, 8),
            shot(f"0{n}a_{key}_default", f"Default {t['name']} template from Vite", 2.3 * inch),
            shot(f"0{n}b_{key}_with_name", "Template with my name added to the GUI", 2.3 * inch),
        ]
        if key == "qwik":
            story.append(shot("07c_qwik_original_error", "Handout code run as-is: useClientEffect$ is not a function", 3.2 * inch))
        story.append(shot(f"0{n}d_{key}_final", f"Final customized app ({t['name']}) with my name", 6.3 * inch))

    story += [
        PageBreak(),
        Paragraph("Takeaways", H1),
        bullets([
            "<b>Vanilla</b> is the most work per feature: every DOM update, escape and state toggle is manual.",
            "<b>Vue</b> felt the most approachable: templates plus <i>v-model</i> and <i>computed</i> made search and sort short.",
            "<b>Preact</b> is React's API in a much smaller package; my React knowledge carried over directly.",
            "<b>Lit</b> produces a standard custom element that can be dropped into any page or framework.",
            "<b>Svelte</b> had the least boilerplate; runes make it clear which values are reactive.",
            "<b>Solid</b> looks like React but you have to think in signals (<i>cartoons()</i>) and use <i>&lt;For&gt;</i>.",
            "<b>Qwik</b> was the most different: loading on the server with <i>routeLoader$</i> means the page is interactive without hydration.",
            "Third-party APIs change: two of the six APIs in the handout were retired, so error handling is not optional.",
        ]),
    ]

    doc = SimpleDocTemplate(str(OUT), pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                            topMargin=0.7 * inch, bottomMargin=0.7 * inch,
                            title="Lab 7 - Anthony Bayate", author="Anthony Bayate")
    doc.build(story)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
