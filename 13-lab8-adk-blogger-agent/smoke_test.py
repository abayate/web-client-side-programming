"""Smoke test: runs root_agent once with InMemoryRunner and prints each event."""
import asyncio, os, sys, time
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__)))
from google.adk.runners import InMemoryRunner
from google.genai import types
from simple_blogger_agent import root_agent
async def main():
    r = InMemoryRunner(agent=root_agent, app_name="smoke")
    s = await r.session_service.create_session(app_name="smoke", user_id="u")
    t = time.time()
    async for ev in r.run_async(user_id="u", session_id=s.session_id if hasattr(s,'session_id') else s.id,
            new_message=types.Content(role="user", parts=[types.Part(text="Write a short blog on caching strategies for web APIs")])):
        calls = [p.function_call.name for p in (ev.content.parts if ev.content else []) if p.function_call]
        txt = "".join(p.text or "" for p in (ev.content.parts if ev.content else []))
        print(f"[{time.time()-t:5.1f}s] {ev.author}: calls={calls} esc={ev.actions.escalate} text={txt[:120]!r}")
asyncio.run(main())
