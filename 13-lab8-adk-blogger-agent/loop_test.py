"""Runs only RobustBlogPlanner and prints every inner event, to watch the retry loop."""
import asyncio, os, sys
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__)))
from google.adk.runners import InMemoryRunner
from google.genai import types
from simple_blogger_agent.agent import robust_blog_planner
async def main():
    r = InMemoryRunner(agent=robust_blog_planner, app_name="t")
    s = await r.session_service.create_session(app_name="t", user_id="u")
    async for ev in r.run_async(user_id="u", session_id=s.id, new_message=types.Content(role="user", parts=[types.Part(text="top ten use cases for AI agents")])):
        txt = "".join(p.text or "" for p in (ev.content.parts if ev.content else []))
        print(ev.author, "esc=", ev.actions.escalate, repr(txt[:80]))
asyncio.run(main())
