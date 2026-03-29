from enum import Enum
from functools import lru_cache
import os

class Prompt(Enum):
    Doctor = "anamnesis_prompt.txt"
    Summarizer = "technical_notes.txt"
    Checker = "task_completion.txt"
    Factory = "new_task_generator.txt"
    Report = "medical_report.txt"
    PdfReport = "pdf_report.txt"

@lru_cache(maxsize=7)
def load_prompt(prompt: Prompt):
    with open(os.path.join("prompts", "anamnesis_prompts", prompt.value), "r") as file:
        return file.read()


