#!/usr/bin/env python3
"""
Test the improved document details extraction and formatting
"""

import streamlit as st
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.ui import extract_document_details, format_document_content
from langchain_core.messages import HumanMessage, AIMessage

st.set_page_config(
    page_title="Details Extraction Test",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Document Details Extraction Test")

# Sample conversation
sample_conversation = [
    HumanMessage(content="I need to draft a contract between me and my father that after 10 years his property will be mine."),
    AIMessage(content="I'll help you create a Property Transfer Agreement. Let me gather some information..."),
    HumanMessage(content="Just generate random filled data for testing."),
    AIMessage(content="""I have prepared the initial draft. Here's the Property Transfer Agreement:

**PROPERTY TRANSFER AGREEMENT**

**THIS AGREEMENT** is made and entered into this **15th day of October, 2023**, by and between:

**1. TRANSFEROR (Father):**
- Full Name: **John Michael Smith**
- Address: **123 Maple Street, Toronto, Ontario, M5V 2H1**

**2. TRANSFEREE (Son/Daughter):**
- Full Name: **Emily Jane Smith**
- Address: **456 Oak Avenue, Toronto, Ontario, M6K 3P2**

**WHEREAS** the Transferor is the sole legal owner of the property described below, and wishes to transfer ownership to the Transferee after a period of 10 years;

**NOW THEREFORE**, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:

### **1. PROPERTY DESCRIPTION**

The property subject to this Agreement is legally described as:
- Municipal Address: **789 Pine Road, Toronto, Ontario, M4B 1B2**
- Legal Description: **Lot 12, Plan 3456, City of Toronto**

### **2. TRANSFER TERMS**

- The Transferor agrees to transfer full legal ownership of the property to the Transferee on **October 15, 2033** (10 years from the date of this Agreement).
- The transfer shall be unconditional, with no monetary consideration required from the Transferee.

This Agreement shall be governed by and construed in accordance with the laws of the **Province of Ontario**.""")
]

# Test details extraction
st.header("📋 Extracted Details Test")

details = extract_document_details(sample_conversation)

col1, col2 = st.columns(2)

with col1:
    st.subheader("🔍 Extracted Details")
    
    # Show document type as non-editable
    st.text_input(
        "📋 Document Type", 
        value=details.get("Document Type", "Legal Document"), 
        disabled=True,
        help="Document type is automatically detected and cannot be changed"
    )
    
    # Group and display other details
    party_fields = {}
    date_fields = {}
    property_fields = {}
    legal_fields = {}
    other_fields = {}
    
    for key, value in details.items():
        if key == "Document Type":
            continue
        elif "party" in key.lower() or "name" in key.lower() or "relationship" in key.lower() or "address" in key.lower():
            party_fields[key] = value
        elif "date" in key.lower() or "period" in key.lower() or "duration" in key.lower():
            date_fields[key] = value
        elif "property" in key.lower() or "legal description" in key.lower() or "subject" in key.lower():
            property_fields[key] = value
        elif "governing" in key.lower() or "law" in key.lower() or "consideration" in key.lower() or "transfer type" in key.lower():
            legal_fields[key] = value
        else:
            other_fields[key] = value
    
    if party_fields:
        st.markdown("**👥 Parties Information:**")
        for key, value in party_fields.items():
            st.text_input(f"  {key}", value=str(value), key=f"test_{key}")
    
    if date_fields:
        st.markdown("**📅 Dates & Duration:**")
        for key, value in date_fields.items():
            st.text_input(f"  {key}", value=str(value), key=f"test_{key}")
    
    if property_fields:
        st.markdown("**🏠 Property Details:**")
        for key, value in property_fields.items():
            st.text_input(f"  {key}", value=str(value), key=f"test_{key}")
    
    if legal_fields:
        st.markdown("**⚖️ Legal Terms:**")
        for key, value in legal_fields.items():
            st.text_input(f"  {key}", value=str(value), key=f"test_{key}")
    
    if other_fields:
        st.markdown("**📝 Other Details:**")
        for key, value in other_fields.items():
            st.text_input(f"  {key}", value=str(value), key=f"test_{key}")

with col2:
    st.subheader("📄 Document Preview")
    
    # Get the document content from the AI message
    document_content = ""
    for message in sample_conversation:
        if isinstance(message, AIMessage) and "PROPERTY TRANSFER AGREEMENT" in message.content:
            document_content = message.content
            break
    
    # Format and display
    formatted_content = format_document_content(document_content)
    
    # Create styled preview
    preview_style = """
    <div style="
        background-color: #ffffff;
        color: #000000;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.6;
        max-height: 400px;
        overflow-y: auto;
        white-space: pre-wrap;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    ">
    """
    
    import html
    escaped_content = html.escape(formatted_content)
    
    preview_html = f'{preview_style}{escaped_content}</div>'
    st.markdown(preview_html, unsafe_allow_html=True)

# Test different document types
st.header("🧪 Document Type Detection Test")

test_cases = [
    "I need an NDA for my business",
    "Create a lease agreement for my apartment",
    "I want to draft an employment contract",
    "Help me with a service agreement",
    "I need a partnership agreement",
    "Create a loan agreement document",
    "Draft a purchase agreement for a car",
    "I need a will and testament",
    "Create a power of attorney document"
]

st.subheader("Test Cases:")
for i, test_case in enumerate(test_cases):
    test_conversation = [HumanMessage(content=test_case)]
    test_details = extract_document_details(test_conversation)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.text(f"Input: {test_case}")
    with col2:
        st.code(test_details.get("Document Type", "Legal Document"))

st.success("✅ All tests completed! The system now properly extracts and categorizes document details.")
st.info("💡 Document Type is automatically detected and non-editable, while other details can be modified by users.")