#!/usr/bin/env python3
"""
Test script for document cleaning functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.ui import clean_legal_document

# Test document with unwanted content
test_document = """
Employment Contract** based on fictitious details. This is for illustrative purposes only and should not be used as a legally binding document without review by a qualified legal professional. 

### **EMPLOYMENT CONTRACT**

1. **Employer:**
   - **Name:** Maple Leaf Enterprises Inc.
   - **Address:** 123 Business Avenue, Toronto, Ontario, M5V 2H1

2. **Employee:**
   - **Name:** John Doe
   - **Address:** 456 Residential Street, Toronto, Ontario, M4B 1G3

### **1. Employment Terms**
   - **Job Title:** Senior Marketing Manager
   - **Job Description:** The Employee will oversee marketing strategies, manage campaigns, and lead the marketing team.
   - **Type of Employment:** Full-time, permanent.
   - **Start Date:** January 1, 2025.
   - **Probationary Period:** 3 months.

### **2. Compensation and Benefits**
   - **Salary:** $85,000 per annum, paid bi-weekly.
   - **Overtime:** Overtime will be compensated at 1.5 times the regular hourly rate.
   - **Benefits:**
     - Health and dental insurance.
     - 3 weeks of paid vacation per year.
     - Annual performance bonus (up to 10% of salary).

**Employee Signature:** ___________________________
**Date:** _______________

This is a template. For a legally binding document, consult a lawyer to tailor it to your specific needs and jurisdiction. Let me know if you need any modifications.
"""

def test_cleaning():
    print("ORIGINAL DOCUMENT:")
    print("=" * 50)
    print(test_document)
    print("\n" + "=" * 50)
    
    cleaned = clean_legal_document(test_document)
    
    print("CLEANED DOCUMENT:")
    print("=" * 50)
    print(cleaned)
    print("\n" + "=" * 50)
    
    print("CLEANING SUMMARY:")
    print(f"Original length: {len(test_document)} characters")
    print(f"Cleaned length: {len(cleaned)} characters")
    print(f"Removed: {len(test_document) - len(cleaned)} characters")
    
    # Check for unwanted phrases
    unwanted_found = []
    unwanted_checks = [
        "based on fictitious details",
        "This is for illustrative purposes",
        "should not be used as a legally binding",
        "This is a template",
        "Let me know",
        "consult a lawyer"
    ]
    
    for phrase in unwanted_checks:
        if phrase.lower() in cleaned.lower():
            unwanted_found.append(phrase)
    
    if unwanted_found:
        print(f"\n❌ STILL CONTAINS UNWANTED TEXT: {unwanted_found}")
    else:
        print("\n✅ ALL UNWANTED TEXT REMOVED!")

if __name__ == "__main__":
    test_cleaning()
