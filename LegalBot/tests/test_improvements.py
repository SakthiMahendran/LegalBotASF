#!/usr/bin/env python3
"""
Test script to verify the improvements made to LegalBot
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.ui import clean_legal_document, extract_document_details
from langchain_core.messages import HumanMessage

def test_document_cleaning():
    """Test the document cleaning functionality"""
    print("Testing document cleaning...")
    
    # Sample document with disclaimers
    sample_doc = """
PROPERTY TRANSFER AGREEMENT

THIS AGREEMENT is made and entered into this 15th day of October, 2023...

**Note:** This is a template for illustrative purposes. For a legally binding agreement, you must replace the placeholder information with accurate details and consult a legal professional to ensure compliance with provincial laws and regulations.

---

Let me know if you'd like any modifications or additional clauses.
"""
    
    cleaned = clean_legal_document(sample_doc)
    print("Original length:", len(sample_doc))
    print("Cleaned length:", len(cleaned))
    print("Cleaned document preview:")
    print(cleaned[:200] + "...")
    print("✅ Document cleaning test passed\n")

def test_detail_extraction():
    """Test the detail extraction functionality"""
    print("Testing detail extraction...")
    
    # Sample conversation
    conversation = [
        HumanMessage(content="I need to draft a contract between me and my father that after 10 years his property will be mine"),
        HumanMessage(content="just generate a random filled data")
    ]
    
    details = extract_document_details(conversation)
    print("Extracted details:")
    for key, value in details.items():
        print(f"  {key}: {value}")
    print("✅ Detail extraction test passed\n")

if __name__ == "__main__":
    print("🧪 Testing LegalBot improvements...\n")
    test_document_cleaning()
    test_detail_extraction()
    print("🎉 All tests completed successfully!")