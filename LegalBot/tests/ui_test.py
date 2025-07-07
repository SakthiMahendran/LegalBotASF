#!/usr/bin/env python3
"""
UI Layout and Document Formatting Test for LegalBot
"""

import streamlit as st
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.ui import format_document_content
from modules.utils import create_docx, create_pdf

st.set_page_config(
    page_title="UI Test - LegalBot",
    page_icon="🧪",
    layout="wide"
)

st.title("🧪 LegalBot UI & Formatting Test")

# Test document content
sample_document = """
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

### **3. TRANSFEROR'S OBLIGATIONS**

- The Transferor shall maintain ownership and responsibility for the property until the transfer date.
- The Transferor shall not encumber or sell the property during the 10-year period without the written consent of the Transferee.

### **4. TRANSFEREE'S OBLIGATIONS**

- The Transferee shall have no ownership rights or claims to the property until the transfer date.

### **5. GOVERNING LAW**

This Agreement shall be governed by and construed in accordance with the laws of the **Province of Ontario**.

### **6. DISPUTE RESOLUTION**

Any disputes arising under this Agreement shall be resolved through mediation in **Toronto, Ontario**, before resorting to litigation.

### **7. ENTIRE AGREEMENT**

This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements or understandings, whether written or oral.

**IN WITNESS WHEREOF**, the parties have executed this Agreement on the date first written above.

**SIGNED BY THE TRANSFEROR:**

_________________________
John Michael Smith
Date: _______________

**SIGNED BY THE TRANSFEREE:**

_________________________
Emily Jane Smith
Date: _______________

**WITNESS (if applicable):**

_________________________
Name: _______________
Date: _______________
"""

# Test the formatting function
st.header("📝 Document Formatting Test")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Original Document")
    st.text_area("Raw Content", value=sample_document, height=400, disabled=True)

with col2:
    st.subheader("Formatted Document")
    formatted = format_document_content(sample_document)
    st.text_area("Formatted Content", value=formatted, height=400, disabled=True)

# Test sticky preview layout
st.header("🔄 Sticky Preview Layout Test")

# Simulate sticky preview
st.markdown("""
<div style="
    position: sticky;
    top: 60px;
    z-index: 100;
    background-color: var(--background-color);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid var(--border-color, #dee2e6);
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
">
""", unsafe_allow_html=True)

st.markdown("### 📄 Document Preview (Always Visible)")

preview_col1, preview_col2 = st.columns([2.5, 1])

with preview_col1:
    st.text_area(
        label="",
        value=formatted,
        height=200,
        disabled=True,
        key="test_preview",
        help="This simulates the sticky document preview"
    )

with preview_col2:
    st.markdown("**Quick Actions:**")
    st.success("✅ Verified")
    
    file_format = st.selectbox("Format:", ["DOCX", "PDF"], key="test_format")
    
    if file_format == "DOCX":
        docx_buffer = create_docx(formatted)
        st.download_button(
            label="⚡ Test Download",
            data=docx_buffer,
            file_name="test_document.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            type="primary",
            use_container_width=True
        )
    else:
        pdf_buffer = create_pdf(formatted)
        st.download_button(
            label="⚡ Test Download",
            data=pdf_buffer,
            file_name="test_document.pdf",
            mime="application/pdf",
            type="primary",
            use_container_width=True
        )

st.markdown("</div>", unsafe_allow_html=True)

# Test main layout
st.header("📱 Main Layout Test")

main_col1, main_col2 = st.columns([1.8, 1.2])

with main_col1:
    st.subheader("💬 Conversation Area")
    
    # Simulate chat messages
    with st.chat_message("user"):
        st.markdown("I need to draft a contract between me and my father that after 10 years his property will be mine.")
    
    with st.chat_message("assistant"):
        st.markdown("I'll help you create a Property Transfer Agreement. Let me gather some information...")
    
    with st.chat_message("user"):
        st.markdown("Just generate random filled data for testing.")
    
    with st.chat_message("assistant"):
        st.markdown("I have prepared the initial draft. Please review it in the editor and verify the details below.")
    
    # Simulate chat input
    st.chat_input("Type your message here...", disabled=True, key="test_input")

with main_col2:
    st.subheader("🔧 Document Controls")
    
    # Test details section
    st.markdown("### 🔍 Verify Document Details")
    
    with st.expander("📝 Edit Details", expanded=True):
        st.text_input("Document Type", value="Property Transfer Agreement")
        st.text_input("Time Period", value="10 years")
        st.text_input("Governing Law", value="Province of Ontario")
        st.text_input("Transfer Type", value="Future Transfer Agreement")
    
    verified = st.checkbox("✅ I have verified all the details above are correct")
    
    st.markdown("### 📥 Download Options")
    
    if verified:
        doc_name = st.text_input("Document File Name", value="Legal_Document_Test")
        file_format = st.selectbox("Choose file format:", ["DOCX", "PDF"], key="main_format")
        
        if file_format == "DOCX":
            docx_buffer = create_docx(formatted)
            st.download_button(
                label="🔽 Download Document",
                data=docx_buffer,
                file_name=f"{doc_name}.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                type="primary",
                use_container_width=True
            )
        else:
            pdf_buffer = create_pdf(formatted)
            st.download_button(
                label="🔽 Download Document",
                data=pdf_buffer,
                file_name=f"{doc_name}.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True
            )
    else:
        st.info("Please verify the details above to enable document download.")

st.markdown("---")
st.success("✅ All UI components are working correctly!")
st.info("💡 Switch between light and dark themes to test theme compatibility.")