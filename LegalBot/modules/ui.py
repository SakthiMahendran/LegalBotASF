import streamlit as st
from langchain_core.messages import AIMessage, HumanMessage
from .agent import get_agent_executor, get_refinement_prompt
from .utils import create_docx, create_pdf


def handle_user_input(prompt: str, chat_id: str):
    """Handles user input for the active chat session."""
    active_chat = st.session_state.chats[chat_id]

    # Add user message to history
    active_chat["history"].append(HumanMessage(content=prompt))

    # Set chat title from first message
    if active_chat["title"] == "New Chat":
        active_chat["title"] = prompt[:30] + "..." if len(prompt) > 30 else prompt

    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            agent_executor = st.session_state.agent_executor

            if active_chat["app_state"] == "DRAFTING":
                response = agent_executor.invoke(
                    {"input": prompt, "history": active_chat["history"]}
                )
                response_content = response["output"]

                if "DRAFT_COMPLETE:" in response_content:
                    draft = response_content.replace("DRAFT_COMPLETE:", "").strip()
                    active_chat["generated_draft"] = draft
                    active_chat["app_state"] = "REVIEWING"
                    active_chat["history"].append(
                        AIMessage(
                            content="I have prepared the initial draft. Please review it in the editor and suggest any changes."
                        )
                    )
                else:
                    active_chat["history"].append(AIMessage(content=response_content))

            elif active_chat["app_state"] == "REVIEWING":
                current_draft = active_chat.get("generated_draft", "")
                refinement_input = get_refinement_prompt(current_draft, prompt)

                response = agent_executor.invoke(
                    {"input": refinement_input, "history": []}
                )

                updated_draft = response["output"]
                active_chat["generated_draft"] = updated_draft
                active_chat["history"].append(
                    AIMessage(
                        content="I have updated the document based on your feedback. Please review the changes."
                    )
                )
    st.rerun()


import re


def format_document_content(content: str) -> str:
    """
    Format raw AI-generated legal draft into a clean, readable legal document.
    - Normalizes whitespace
    - Formats headings
    - Capitalizes clause titles
    - Numbers main sections
    - Adds consistent indentation
    """

    # Step 1: Remove extra blank lines
    content = re.sub(r"\n\s*\n+", "\n\n", content.strip())

    # Step 2: Capitalize and bold common legal headings
    headings = [
        "agreement",
        "parties",
        "definitions",
        "terms",
        "termination",
        "confidentiality",
        "governing law",
        "dispute resolution",
        "miscellaneous",
        "signatures",
        "witnesseth",
        "now, therefore",
    ]
    for heading in headings:
        pattern = rf"(?<=\n)({heading})(?=\n)"
        content = re.sub(
            pattern, lambda m: m.group(1).upper(), content, flags=re.IGNORECASE
        )

    # Step 3: Add numbering to major clauses (if not already numbered)
    lines = content.split("\n")
    numbered_lines = []
    section_number = 1

    for line in lines:
        # Treat as heading if ALL CAPS or matches section keywords
        if line.strip().upper() in [
            h.upper() for h in headings
        ] or line.strip().endswith(":"):
            numbered_lines.append(f"{section_number}. {line.strip().upper()}")
            section_number += 1
        else:
            # Add indentation to regular paragraph lines
            numbered_lines.append("    " + line.strip())

    formatted = "\n\n".join(numbered_lines)

    # Step 4: Ensure final newline
    return formatted.strip() + "\n"


def clean_legal_document(raw_text: str) -> str:
    """
    Cleans and normalizes the raw legal text:
    - Removes AI assistant messages and unwanted text
    - Removes extra spaces
    - Fixes punctuation spacing
    - Standardizes line breaks
    - Extracts only the actual legal document content
    """
    import re

    text = raw_text.strip()

    # Remove common AI assistant phrases and unwanted messages
    unwanted_phrases = [
        r"Understood\.\s*",
        r"Below is a draft\s+.*?\.\s*",
        r"Please review it and let me know.*?\.\s*",
        r"if you'd like any modifications.*?\.\s*",
        r"if you'd like to replace.*?\.\s*",
        r"Here is.*?draft.*?\:\s*",
        r"I'll help you create.*?\.\s*",
        r"Let me draft.*?for you\.\s*",
        r"Here's a.*?document.*?\:\s*",
        r"I've prepared.*?document.*?\.\s*",
        r"This document.*?placeholder.*?\.\s*",
        r"Note:.*?placeholder.*?\.\s*",
        r"Please note.*?placeholder.*?\.\s*",
        r"\*\*Note:.*?\*\*\s*",
        r"---+\s*",  # Remove separator lines
        r"^\s*\*\*.*?\*\*\s*$",  # Remove lines with only bold text
        r"based on fictitious details.*?\.\s*",
        r"This is for illustrative purposes only.*?\.\s*",
        r"should not be used as a legally binding document.*?\.\s*",
        r"without review by a qualified legal professional.*?\.\s*",
        r"This is a template.*?\.\s*",
        r"For a legally binding document.*?\.\s*",
        r"consult a lawyer.*?\.\s*",
        r"to tailor it to your specific needs.*?\.\s*",
        r"Let me know.*$",  # Remove trailing "Let me know"
        r"If you need.*?modifications.*?\.\s*",
        r"Please let me know.*?\.\s*",
        r"Feel free to.*?\.\s*",
        r"This template.*?\.\s*",
        r"Disclaimer:.*?\.\s*",
        r"\*\*Disclaimer:.*?\*\*\s*",
        r"Important:.*?\.\s*",
        r"\*\*Important:.*?\*\*\s*",
    ]

    # Remove unwanted phrases
    for phrase in unwanted_phrases:
        text = re.sub(phrase, "", text, flags=re.IGNORECASE | re.MULTILINE)

    # Remove text after common document endings
    ending_patterns = [
        r"This is a template.*$",
        r"For a legally binding document.*$",
        r"consult a lawyer.*$",
        r"Let me know.*$",
        r"If you need.*$",
        r"Please let me know.*$",
        r"Feel free to.*$",
        r"This template.*$",
        r"Disclaimer:.*$",
        r"Important:.*$",
    ]

    for pattern in ending_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.DOTALL)

    # Remove any text that appears after signature lines (common ending point)
    signature_match = re.search(
        r"(Employee Signature:.*?Date:.*?_______________)", text, re.DOTALL
    )
    if signature_match:
        # Keep text only up to the end of signature section
        text = text[: signature_match.end()]

    # Remove any text before the actual document title (if it starts with a legal document pattern)
    legal_doc_patterns = [
        r"(EMPLOYMENT CONTRACT|EMPLOYMENT AGREEMENT)",
        r"(PROPERTY TRANSFER AGREEMENT|PROPERTY TRANSFER)",
        r"(NON-DISCLOSURE AGREEMENT|NDA)",
        r"(SERVICE AGREEMENT|SERVICE CONTRACT)",
        r"(LEASE AGREEMENT|RENTAL AGREEMENT)",
        r"(PARTNERSHIP AGREEMENT)",
        r"(CONTRACT|AGREEMENT)",
    ]

    for pattern in legal_doc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # Extract text starting from the document title
            text = text[match.start() :]
            break

    # Clean up markdown and formatting
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)  # Remove bold markdown
    text = re.sub(r"###\s*\*\*\s*", "", text)  # Remove ### ** patterns
    text = re.sub(r"###\s*", "", text)  # Remove ### headers
    text = re.sub(r"\*\s*", "", text)  # Remove bullet points
    text = re.sub(r"^\s*-\s*", "", text, flags=re.MULTILINE)  # Remove dash bullets

    # Clean up formatting while preserving structure
    text = re.sub(
        r"[ \t]+", " ", text
    )  # Collapse multiple spaces/tabs but preserve newlines
    text = re.sub(r"\s([.,;:])", r"\1", text)  # Remove space before punctuation
    text = re.sub(
        r"\n\s*\n\s*\n+", "\n\n", text
    )  # Normalize multiple newlines to double
    text = re.sub(r"^\s*\n+", "", text)  # Remove leading newlines
    text = re.sub(r"\n+\s*$", "", text)  # Remove trailing newlines

    # Ensure proper spacing after colons and periods
    text = re.sub(
        r":([A-Z])", r": \1", text
    )  # Add space after colon before capital letter
    text = re.sub(
        r"\.([A-Z])", r". \1", text
    )  # Add space after period before capital letter

    # Ensure proper paragraph spacing for legal documents
    text = re.sub(
        r"\n([A-Z][^.]*:)", r"\n\n\1", text
    )  # Add space before section headers
    text = re.sub(r"(\d+\.)\s*([A-Z])", r"\n\1 \2", text)  # Format numbered sections

    return text.strip()


def extract_document_details(text: str) -> dict:
    """
    Extracts basic structured fields from a legal document draft.
    You can replace this with more advanced NLP later.
    """

    def find(pattern, fallback="Not Found"):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else fallback

    details = {
        "party_a": find(r"This agreement is made between\s+(.*?)\s+and"),
        "party_b": find(r"and\s+(.*?)\s+on"),  # tweak based on your draft pattern
        "effective_date": find(r"effective\s+on\s+([A-Za-z0-9,\s]+)[\.\n]"),
        "term": find(r"shall remain in effect for\s+([A-Za-z0-9\s]+)[\.\n]"),
        "jurisdiction": find(r"governed by the laws of\s+([A-Za-z\s]+)[\.\n]"),
    }

    return details


def display_chat_interface(chat_id: str, api_key: str):
    """Renders the main UI for conversation and document drafting."""
    # Initialize agent if it doesn't exist
    if not st.session_state.get("agent_executor"):
        st.session_state.agent_executor = get_agent_executor(api_key)

    active_chat = st.session_state.chats[chat_id]

    # --- LAYOUT ---
    col1, col2 = st.columns([3, 2])

    with col1:
        st.header("Conversation")
        # Display chat history
        for message in active_chat["history"]:
            if isinstance(message, HumanMessage):
                with st.chat_message("user"):
                    st.markdown(message.content)
            elif isinstance(message, AIMessage):
                with st.chat_message("assistant"):
                    st.markdown(message.content)

        # Spacer at the bottom
        st.markdown("<div style='height: 50px;'></div>", unsafe_allow_html=True)

        # Chat input at the bottom of the column
        prompt = st.chat_input("Your message...")
        if prompt:
            handle_user_input(prompt, chat_id)

    with col2:
        st.header("Document Draft")
        if active_chat["app_state"] == "REVIEWING":
            edited_draft = st.text_area(
                "Edit the draft below:",
                value=active_chat["generated_draft"],
                height=600,
                key=f"editor_{chat_id}",
            )
            active_chat["generated_draft"] = edited_draft

            st.markdown("---")
            st.subheader("Finalize & Download")

            doc_name = st.text_input(
                "Document File Name",
                f"Legal_Document_{chat_id[:4]}",
                key=f"doc_name_{chat_id}",
            )

            docx_buffer = create_docx(active_chat["generated_draft"])
            st.download_button(
                label="Download as DOCX",
                data=docx_buffer,
                file_name=f"{doc_name}.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                key=f"docx_{chat_id}",
            )

            pdf_buffer = create_pdf(active_chat["generated_draft"])
            st.download_button(
                label="Download as PDF",
                data=pdf_buffer,
                file_name=f"{doc_name}.pdf",
                mime="application/pdf",
                key=f"pdf_{chat_id}",
            )
        else:
            st.info(
                "The document draft will appear here once enough information has been gathered."
            )
