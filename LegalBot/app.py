import streamlit as st
import os
import uuid
from dotenv import load_dotenv
from modules.ui import display_chat_interface

st.set_page_config(
    page_title="Agentic Legal AI",
    page_icon="📜",
    layout="wide"
)

# Load API Key from .env file
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# --- STATE INITIALIZATION ---
if "chats" not in st.session_state:
    st.session_state.chats = {}
if "active_chat_id" not in st.session_state:
    st.session_state.active_chat_id = None
if "agent_executor" not in st.session_state:
    st.session_state.agent_executor = None


def create_new_chat():
    """Creates and switches to a new chat session."""
    chat_id = str(uuid.uuid4())
    st.session_state.chats[chat_id] = {
        "title": "New Chat",
        "history": [],
        "generated_draft": "",
        "app_state": "DRAFTING" # DRAFTING or REVIEWING
    }
    st.session_state.active_chat_id = chat_id
    st.rerun()

# --- SIDEBAR ---
with st.sidebar:
    st.title("Legal AI Suite")
    
    if st.button("➕ New Chat", use_container_width=True):
        create_new_chat()

    st.markdown("---")
    st.subheader("Chat History")

    if not st.session_state.chats:
        st.caption("No chats yet.")
    else:
        # Display chats, most recent first
        for chat_id in reversed(list(st.session_state.chats.keys())):
            chat_title = st.session_state.chats[chat_id]["title"]
            if st.button(chat_title, key=f"chat_{chat_id}", use_container_width=True):
                st.session_state.active_chat_id = chat_id
                st.rerun()
    
    st.markdown("---")
    # st.info("This app uses AI and may produce inaccurate or some irrelevant information. Always consult a qualified professional.")


# --- MAIN CHAT INTERFACE ---
if not OPENROUTER_API_KEY:
    st.error("OPENROUTER_API_KEY not found in your .env file. Please add it to run the application.")
    st.stop()

if st.session_state.active_chat_id is None:
    st.info("Start a new chat or select one from the history in the sidebar.")
else:
    display_chat_interface(st.session_state.active_chat_id, OPENROUTER_API_KEY)
