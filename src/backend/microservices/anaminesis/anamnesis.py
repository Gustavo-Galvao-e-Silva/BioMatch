import json
import copy
from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.genai import types
from agents import doctor, summarizer, checker_agent, task_factory
from schemas import GoalCheck, NewTasks, PatientSummary

# Global state — single user at a time, no race conditions
current_state: dict = {}


class AnamnesisAgent(BaseAgent):
    def __init__(self, **kwargs):
        super().__init__(
            name="anamnesis",
            sub_agents=[doctor, summarizer, checker_agent, task_factory],
            **kwargs,
        )

    async def _run_async_impl(self, ctx: InvocationContext):
        global current_state

        if "current_goals" not in ctx.session.state:
            ctx.session.state["current_goals"] = ["Identify primary symptom"]

        # If patient just answered, process it first
        if ctx.session.state.get("awaiting_patient"):
            # --- Step 2: Summarizer ---
            async for event in summarizer.run_async(ctx):
                yield event
                if hasattr(event, "data") and isinstance(event.data, PatientSummary):
                    ctx.session.state["patient_summary"] = event.data.model_dump()
                elif event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            try:
                                ctx.session.state["patient_summary"] = PatientSummary(
                                    **json.loads(part.text.strip())
                                ).model_dump()
                            except Exception:
                                pass

            print(f"[DEBUG] Summary: {ctx.session.state.get('patient_summary')}")

            # --- Step 3: Checker ---
            remove = []
            for goal in ctx.session.state["current_goals"]:
                ctx.session.state["goal"] = goal
                events = [event async for event in checker_agent.run_async(ctx)]
                satisfied = False
                for event in reversed(events):
                    if event.content and event.content.parts:
                        for part in event.content.parts:
                            if part.text:
                                try:
                                    check = GoalCheck(**json.loads(part.text.strip()))
                                    satisfied = check.satisfied
                                    break
                                except Exception:
                                    continue
                    if satisfied is not False:
                        break
                remove.append(satisfied)

            items_removed = 0
            for i, complete in enumerate(remove):
                if complete is True:
                    ctx.session.state["current_goals"].pop(i - items_removed)
                    items_removed += 1

            # --- Step 4: Factory ---
            if len(ctx.session.state["current_goals"]):
                events = [event async for event in task_factory.run_async(ctx)]
                new_tasks = NewTasks(**json.loads(events[-1].content.parts[0].text))
                existing = set(ctx.session.state["current_goals"])
                for task in new_tasks.added_tasks:
                    if task not in existing:
                        ctx.session.state["current_goals"].append(task)

        # --- Step 1: Doctor asks next question ---
        if ctx.session.state.get("current_goals"):
            last_doctor_text = ""
            async for event in doctor.run_async(ctx):
                yield event
                if event.author == "doctor" and event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            last_doctor_text = part.text
            ctx.session.state["last_doctor_message"] = last_doctor_text
            ctx.session.state["awaiting_patient"] = True
        # No yield for completion — just let the function end naturally,
        # api.py detects completion via empty current_goals in current_state

        # --- Final: build complete snapshot of all fields and assign to global ---
        patient_summary = ctx.session.state.get("patient_summary")
        if hasattr(patient_summary, "model_dump"):
            patient_summary_dict = patient_summary.model_dump()
        elif isinstance(patient_summary, dict):
            patient_summary_dict = patient_summary
        else:
            patient_summary_dict = {"findings_summary": "", "confidence_score": 0.0}

        ctx.session.state["__snapshot__"] = {
            "current_goals": ctx.session.state.get("current_goals", []),
            "patient_summary": patient_summary_dict,
            "awaiting_patient": ctx.session.state.get("awaiting_patient", False),
            "last_patient_message": ctx.session.state.get("last_patient_message", ""),
            "last_doctor_message": ctx.session.state.get("last_doctor_message", ""),
        }

        current_state = copy.deepcopy(ctx.session.state["__snapshot__"])
