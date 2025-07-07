"""
AI Agent service for LegalBot (Django backend).
Directly imports and uses logic from modules/agent.py.
"""

import sys
import os
from pathlib import Path
from django.conf import settings
from langchain_core.messages import AIMessage, HumanMessage

# Ensure the parent directory is in sys.path for import
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Import the modules directly
from modules.agent import get_agent_executor, get_refinement_prompt
from modules.ui import clean_legal_document, extract_document_details


def generate_legal_document(prompt, conversation_history=None):
    """
    Generate legal document using the existing Streamlit modules.
    
    Args:
        prompt (str): User input prompt
        conversation_history (list): List of conversation messages in format:
                                   [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    
    Returns:
        str: AI response or document content
    """
    try:
        # Get API key from Django settings
        api_key = getattr(settings, 'LLM_API_KEY', '')
        if not api_key:
            raise ValueError("LLM_API_KEY not configured in Django settings")
        
        # Initialize agent executor
        agent_executor = get_agent_executor(api_key)
        
        # Convert conversation history to LangChain message format
        history = []
        if conversation_history:
            for msg in conversation_history:
                if msg.get('role') == 'user':
                    history.append(HumanMessage(content=msg.get('content', '')))
                elif msg.get('role') == 'assistant':
                    history.append(AIMessage(content=msg.get('content', '')))
        
        # Add current user message to history
        history.append(HumanMessage(content=prompt))
        
        # Generate response using agent
        response = agent_executor.invoke({
            "input": prompt,
            "history": history
        })
        
        response_content = response["output"]
        
        # Check if this is a draft completion
        if "DRAFT_COMPLETE:" in response_content:
            draft = response_content.replace("DRAFT_COMPLETE:", "").strip()
            # Clean the document using existing utility
            cleaned_draft = clean_legal_document(draft)
            return f"DRAFT_COMPLETE: {cleaned_draft}"
        
        return response_content
        
    except Exception as e:
        raise Exception(f"Error generating legal document: {str(e)}")


def refine_legal_document(current_draft, user_request):
    """
    Refine an existing legal document based on user feedback.
    
    Args:
        current_draft (str): Current document content
        user_request (str): User's refinement request
    
    Returns:
        str: Updated document content
    """
    try:
        # Get API key from Django settings
        api_key = getattr(settings, 'OPENROUTER_API_KEY', '')
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not configured in Django settings")
        
        # Initialize agent executor
        agent_executor = get_agent_executor(api_key)
        
        # Get refinement prompt
        refinement_input = get_refinement_prompt(current_draft, user_request)
        
        # Generate refined document
        response = agent_executor.invoke({
            "input": refinement_input,
            "history": []  # Empty history for refinement
        })
        
        updated_draft = response["output"]
        # Clean the document
        cleaned_draft = clean_legal_document(updated_draft)
        
        return cleaned_draft
        
    except Exception as e:
        raise Exception(f"Error refining legal document: {str(e)}")


def extract_document_details_from_history(conversation_history):
    """
    Extract document details from conversation history.
    
    Args:
        conversation_history (list): List of conversation messages
    
    Returns:
        dict: Extracted document details
    """
    try:
        # Convert to LangChain message format
        history = []
        if conversation_history:
            for msg in conversation_history:
                if msg.get('role') == 'user':
                    history.append(HumanMessage(content=msg.get('content', '')))
                elif msg.get('role') == 'assistant':
                    history.append(AIMessage(content=msg.get('content', '')))
        
        # Extract details using existing utility
        details = extract_document_details(history)
        return details
        
    except Exception as e:
        raise Exception(f"Error extracting document details: {str(e)}")
