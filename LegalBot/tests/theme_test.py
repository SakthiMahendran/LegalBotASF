#!/usr/bin/env python3
"""
Theme compatibility test for LegalBot
"""

import streamlit as st

st.set_page_config(
    page_title="Theme Test - LegalBot",
    page_icon="🎨",
    layout="wide"
)

st.title("🎨 Theme Compatibility Test")

st.markdown("""
This page tests the theme compatibility of LegalBot components.
Try switching between light and dark themes using the settings menu (☰ → Settings → Theme).
""")

# Test document preview
st.header("Document Preview Test")

sample_document = """
PROPERTY TRANSFER AGREEMENT

THIS AGREEMENT is made and entered into this 15th day of October, 2023, by and between:

1. TRANSFEROR (Father):
- Full Name: John Michael Smith
- Address: 123 Maple Street, Toronto, Ontario, M5V 2H1

2. TRANSFEREE (Son/Daughter):
- Full Name: Emily Jane Smith
- Address: 456 Oak Avenue, Toronto, Ontario, M6K 3P2

WHEREAS the Transferor is the sole legal owner of the property described below, and wishes to transfer ownership to the Transferee after a period of 10 years;

NOW THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:

1. PROPERTY DESCRIPTION
The property subject to this Agreement is legally described as:
- Municipal Address: 789 Pine Road, Toronto, Ontario, M4B 1B2
- Legal Description: Lot 12, Plan 3456, City of Toronto

2. TRANSFER TERMS
- The Transferor agrees to transfer full legal ownership of the property to the Transferee on October 15, 2033 (10 years from the date of this Agreement).
- The transfer shall be unconditional, with no monetary consideration required from the Transferee.
"""

# Test with disabled text area (like in document preview)
st.subheader("Disabled Text Area (Document Preview Style)")
st.text_area(
    "Document Preview",
    value=sample_document,
    height=300,
    disabled=True,
    help="This simulates the document preview in LegalBot"
)

# Test with regular text area
st.subheader("Regular Text Area (Editor Style)")
st.text_area(
    "Document Editor",
    value=sample_document,
    height=200,
    help="This simulates the document editor in LegalBot"
)

# Test other components
st.header("Other Components Test")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Input Fields")
    st.text_input("Name", value="John Smith")
    st.selectbox("Province", ["Ontario", "Quebec", "British Columbia"])
    st.checkbox("I verify the details are correct")

with col2:
    st.subheader("Status Messages")
    st.info("This is an info message")
    st.success("This is a success message")
    st.error("This is an error message")

# Test buttons
st.header("Button Test")
col1, col2, col3 = st.columns(3)

with col1:
    st.button("Regular Button")

with col2:
    st.button("Primary Button", type="primary")

with col3:
    st.download_button("Download Button", data="test", file_name="test.txt")

st.markdown("---")
st.caption("Switch between light and dark themes to test compatibility!")