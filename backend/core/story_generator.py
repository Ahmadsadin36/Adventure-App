# backend/core/story_generator.py
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from core.config import settings
from models.story import Story, StoryNode
from core.models import StoryLLMResponse, StoryNodeLLM
from core.prompts import STORY_PROMPT

class StoryGenerator:
    """
    Generates and persists a branching story.
    Uses OpenAI (via langchain) when a key is present; otherwise uses a local deterministic sample.
    """

    # -------- Public API --------
    @classmethod
    def generate_story(cls, db: Session, session_id: str, theme: str = "fantasy") -> Story:
        # [sample update]: Fallback to sample generation when no API key is configured.
        if settings.has_openai:
            try:
                return cls._generate_with_llm(db, session_id, theme)
            except Exception:
                # Hard fallback to sample if LLM path fails for any reason (missing deps, bad key, etc.)
                return cls._generate_sample(db, session_id, theme)
        else:
            return cls._generate_sample(db, session_id, theme)

    # -------- LLM path (optional) --------
    @classmethod
    def _get_llm(cls):
        # [sample update]: Import lazily to avoid requiring langchain_openai when in sample mode.
        openai_key = settings.OPENAI_API_KEY or settings.CHOREO_OPENAI_CONNECTION_OPENAI_API_KEY
        base_url = settings.openai_base_url

        if not openai_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")

        from langchain_openai import ChatOpenAI  # type: ignore
        # Use base_url if provided (e.g., Choreo)
        kwargs: Dict[str, Any] = {"model": "gpt-4o-mini", "api_key": openai_key}
        if base_url:
            kwargs["base_url"] = base_url
        return ChatOpenAI(**kwargs)

    @classmethod
    def _generate_with_llm(cls, db: Session, session_id: str, theme: str) -> Story:
        # [sample update]: Keep this minimal; structure mirrors the sample path so the frontend stays identical.
        from langchain_core.prompts import ChatPromptTemplate  # type: ignore
        from langchain_core.output_parsers import PydanticOutputParser  # type: ignore

        llm = cls._get_llm()
        parser = PydanticOutputParser(pydantic_object=StoryLLMResponse)
        prompt = ChatPromptTemplate.from_messages([
            ("system", STORY_PROMPT),
            ("user", "Theme: {theme}\nReturn ONLY valid JSON per the schema.")
        ])

        chain = prompt | llm | parser
        story_data: StoryLLMResponse = chain.invoke({"theme": theme})

        # Persist story & nodes:
        story_db = Story(title=story_data.title, session_id=session_id)
        db.add(story_db)
        db.flush()

        cls._process_story_node(db, story_db.id, story_data.rootNode, is_root=True)
        db.commit()
        return story_db

    # -------- Sample path (no API needed) --------
    @classmethod
    def _generate_sample(cls, db: Session, session_id: str, theme: str) -> Story:
        # [sample update]: Deterministic, 3-4 levels deep, includes winning & losing endings.
        story_db = Story(title=f"Adventure: {theme}", session_id=session_id)
        db.add(story_db)
        db.flush()

        # Level 1 (root)
        root = cls._create_node(db, story_db.id, content=f"You wake up in a world of “{theme}”. Three paths beckon.", is_root=True)

        # Level 2
        path_bold = cls._create_node(db, story_db.id, content="You make a bold move, rushing toward the unknown.")
        path_careful = cls._create_node(db, story_db.id, content="You plan carefully, mapping every step.")
        path_seeking = cls._create_node(db, story_db.id, content="You seek help, gathering allies and clues.")

        cls._set_options(root, [
            {"text": "Be bold", "node_id": path_bold.id},
            {"text": "Be careful", "node_id": path_careful.id},
            {"text": "Ask for help", "node_id": path_seeking.id},
        ])

        # Level 3
        bold_win = cls._create_node(db, story_db.id, content="Your momentum pays off—treasure in sight.", is_ending=True, is_winning_ending=True)
        bold_trap = cls._create_node(db, story_db.id, content="A trap snaps shut—game over.", is_ending=True)

        care_detour = cls._create_node(db, story_db.id, content="A hidden detour reveals a safer passage.")
        care_stuck = cls._create_node(db, story_db.id, content="You overthink and miss your chance.", is_ending=True)

        seek_pact = cls._create_node(db, story_db.id, content="Allies propose a risky pact.")
        seek_clue = cls._create_node(db, story_db.id, content="A clue points to an ancient gate.")

        cls._set_options(path_bold, [
            {"text": "Seize the prize", "node_id": bold_win.id},
            {"text": "Ignore the warning signs", "node_id": bold_trap.id},
        ])
        cls._set_options(path_careful, [
            {"text": "Take the detour", "node_id": care_detour.id},
            {"text": "Keep analyzing", "node_id": care_stuck.id},
        ])
        cls._set_options(path_seeking, [
            {"text": "Accept the pact", "node_id": seek_pact.id},
            {"text": "Follow the clue", "node_id": seek_clue.id},
        ])

        # Level 4 from care_detour
        detour_win = cls._create_node(db, story_db.id, content="Patience rewarded—you arrive precisely when needed.", is_ending=True, is_winning_ending=True)
        detour_late = cls._create_node(db, story_db.id, content="Too late; the door closes forever.", is_ending=True)
        cls._set_options(care_detour, [
            {"text": "Wait for the right moment", "node_id": detour_win.id},
            {"text": "Hurry anyway", "node_id": detour_late.id},
        ])

        # Level 4 from seek paths
        pact_betrayal = cls._create_node(db, story_db.id, content="Betrayed mid-journey—lesson learned.", is_ending=True)
        pact_glory = cls._create_node(db, story_db.id, content="Trust well-placed—you share the glory.", is_ending=True, is_winning_ending=True)
        clue_maze = cls._create_node(db, story_db.id, content="The maze tests resolve before the gate.", is_ending=True)
        cls._set_options(seek_pact, [
            {"text": "Trust them fully", "node_id": pact_glory.id},
            {"text": "Keep your guard up", "node_id": pact_betrayal.id},
        ])
        cls._set_options(seek_clue, [
            {"text": "Enter the maze", "node_id": clue_maze.id},
        ])

        db.commit()
        return story_db

    # -------- Helpers --------
    @classmethod
    def _create_node(cls, db: Session, story_id: int, *, content: str, is_root: bool=False, is_ending: bool=False, is_winning_ending: bool=False) -> StoryNode:
        node = StoryNode(
            story_id=story_id,
            content=content,
            is_root=is_root,
            is_ending=is_ending,
            is_winning_ending=is_winning_ending,
            options=[]
        )
        db.add(node)
        db.flush()
        return node

    @classmethod
    def _set_options(cls, node: StoryNode, options: list[dict]):
        node.options = options

    @classmethod
    def _process_story_node(cls, db: Session, story_id: int, node_data: StoryNodeLLM, is_root: bool) -> StoryNode:
        # Normalize from dict to pydantic if needed
        if isinstance(node_data, dict):
            node_data = StoryNodeLLM.model_validate(node_data)

        node = StoryNode(
            story_id=story_id,
            content=node_data.content,
            is_root=is_root,
            is_ending=node_data.isEnding,
            is_winning_ending=node_data.isWinningEnding,
            options=[]
        )
        db.add(node)
        db.flush()

        # Recursively process options
        if node_data.options:
            options_list = []
            for option in node_data.options:
                if isinstance(option, dict):
                    next_node = option.get("nextNode")
                    text = option.get("text", "Continue")
                else:
                    next_node = option.nextNode
                    text = option.text

                if isinstance(next_node, dict):
                    next_node = StoryNodeLLM.model_validate(next_node)

                child_node = cls._process_story_node(db, story_id, next_node, False)
                options_list.append({"text": text, "node_id": child_node.id})
            node.options = options_list

        db.flush()
        return node