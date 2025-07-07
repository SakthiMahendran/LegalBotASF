#!/usr/bin/env python3
"""
Comprehensive API test script for LegalBot Django API.
Tests all the converted Streamlit functionality.
"""

import requests
import json
import sys
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test AI agent health check endpoint."""
    print("🔍 Testing AI Agent Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/api/ai/health/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check Response: {json.dumps(data, indent=2)}")
            return data.get('status') == 'healthy'
        else:
            print(f"❌ Health check failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_ai_generation():
    """Test AI document generation."""
    print("\n🤖 Testing AI Document Generation...")
    try:
        payload = {
            "prompt": "I need a property transfer agreement between John Smith and Jane Doe for a property in Toronto",
            "conversation_history": []
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/generate/", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', '')
            print(f"✅ AI Response (first 200 chars): {result[:200]}...")
            return True, result
        else:
            print(f"❌ AI generation failed: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ AI generation error: {e}")
        return False, None

def test_ai_refinement():
    """Test AI document refinement."""
    print("\n✏️ Testing AI Document Refinement...")
    try:
        sample_draft = """
        PROPERTY TRANSFER AGREEMENT
        
        This agreement is made between John Smith and Jane Doe
        for the transfer of property located at 123 Main Street.
        """
        
        payload = {
            "current_draft": sample_draft,
            "user_request": "Please change the address to 456 Oak Avenue and add the date as October 15, 2024"
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/refine/", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', '')
            print(f"✅ Refined Document (first 200 chars): {result[:200]}...")
            return True, result
        else:
            print(f"❌ AI refinement failed: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ AI refinement error: {e}")
        return False, None

def test_detail_extraction():
    """Test document detail extraction."""
    print("\n📋 Testing Document Detail Extraction...")
    try:
        payload = {
            "conversation_history": [
                {"role": "user", "content": "I need a property transfer agreement"},
                {"role": "assistant", "content": "I'll help you create a property transfer agreement. What are the names of the parties involved?"},
                {"role": "user", "content": "John Michael Smith and Emily Jane Smith"},
                {"role": "assistant", "content": "What is the property address?"},
                {"role": "user", "content": "789 Pine Road, Toronto, Ontario, M4B 1B2"}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/extract-details/", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            details = data.get('details', {})
            print(f"✅ Extracted Details: {json.dumps(details, indent=2)}")
            return True, details
        else:
            print(f"❌ Detail extraction failed: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Detail extraction error: {e}")
        return False, None

def test_session_management():
    """Test session CRUD operations."""
    print("\n📝 Testing Session Management...")
    try:
        # Create a new session
        session_payload = {
            "title": "Test Property Transfer",
            "status": "drafting"
        }
        
        response = requests.post(f"{BASE_URL}/api/sessions/", json=session_payload)
        print(f"Create Session Status Code: {response.status_code}")
        
        if response.status_code == 201:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Created Session: {session_id}")
            
            # List sessions
            response = requests.get(f"{BASE_URL}/api/sessions/")
            if response.status_code == 200:
                sessions = response.json()
                print(f"✅ Listed {len(sessions.get('results', []))} sessions")
                return True, session_id
            else:
                print(f"❌ Failed to list sessions: {response.text}")
                return False, None
        else:
            print(f"❌ Session creation failed: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Session management error: {e}")
        return False, None

def test_document_operations(session_id):
    """Test document creation and download."""
    print("\n📄 Testing Document Operations...")
    try:
        # Create a document
        doc_payload = {
            "session": session_id,
            "document_type": "Property Transfer Agreement",
            "content": """
PROPERTY TRANSFER AGREEMENT

This agreement is made on October 15, 2024, between:

**TRANSFEROR:** John Michael Smith
Address: 123 Maple Street, Toronto, Ontario, M5V 2H1

**TRANSFEREE:** Emily Jane Smith  
Address: 456 Oak Avenue, Toronto, Ontario, M6K 3P2

**PROPERTY:** 789 Pine Road, Toronto, Ontario, M4B 1B2

The transferor agrees to transfer the above property to the transferee under the terms specified herein.

**GOVERNING LAW:** This agreement shall be governed by the laws of the Province of Ontario.

Signed this 15th day of October, 2024.

_____________________
John Michael Smith

_____________________
Emily Jane Smith
            """,
            "formatted_content": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/documents/", json=doc_payload)
        print(f"Create Document Status Code: {response.status_code}")
        
        if response.status_code == 201:
            doc_data = response.json()
            doc_id = doc_data.get('id')
            print(f"✅ Created Document: {doc_id}")
            
            # Test document generation
            response = requests.post(f"{BASE_URL}/api/documents/{doc_id}/generate/")
            if response.status_code == 200:
                print("✅ Document formatting successful")
                
                # Test DOCX download
                response = requests.get(f"{BASE_URL}/api/documents/{doc_id}/download/?format=docx")
                if response.status_code == 200:
                    print("✅ DOCX download successful")
                    
                    # Save the file for verification
                    with open("test_document.docx", "wb") as f:
                        f.write(response.content)
                    print("📁 Saved test_document.docx")
                
                # Test PDF download
                response = requests.get(f"{BASE_URL}/api/documents/{doc_id}/download/?format=pdf")
                if response.status_code == 200:
                    print("✅ PDF download successful")
                    
                    # Save the file for verification
                    with open("test_document.pdf", "wb") as f:
                        f.write(response.content)
                    print("📁 Saved test_document.pdf")
                
                return True
            else:
                print(f"❌ Document generation failed: {response.text}")
                return False
        else:
            print(f"❌ Document creation failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Document operations error: {e}")
        return False

def main():
    """Run all API tests."""
    print("🚀 Starting LegalBot API Tests")
    print("=" * 50)
    
    # Test 1: Health Check
    health_ok = test_health_check()
    
    # Test 2: AI Generation
    ai_ok, ai_result = test_ai_generation()
    
    # Test 3: AI Refinement
    refine_ok, refined_result = test_ai_refinement()
    
    # Test 4: Detail Extraction
    extract_ok, extracted_details = test_detail_extraction()
    
    # Test 5: Session Management
    session_ok, session_id = test_session_management()
    
    # Test 6: Document Operations
    doc_ok = False
    if session_id:
        doc_ok = test_document_operations(session_id)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"AI Generation: {'✅ PASS' if ai_ok else '❌ FAIL'}")
    print(f"AI Refinement: {'✅ PASS' if refine_ok else '❌ FAIL'}")
    print(f"Detail Extraction: {'✅ PASS' if extract_ok else '❌ FAIL'}")
    print(f"Session Management: {'✅ PASS' if session_ok else '❌ FAIL'}")
    print(f"Document Operations: {'✅ PASS' if doc_ok else '❌ FAIL'}")
    
    all_passed = all([health_ok, ai_ok, refine_ok, extract_ok, session_ok, doc_ok])
    print(f"\n🎯 Overall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if not all_passed:
        print("\n🔧 TROUBLESHOOTING TIPS:")
        print("1. Make sure Django server is running: python manage.py runserver")
        print("2. Check that OPENROUTER_API_KEY is set in .env file")
        print("3. Verify all dependencies are installed: pip install -r requirements.txt")
        print("4. Run migrations: python manage.py migrate")
        print("5. Check Django logs for detailed error messages")

if __name__ == "__main__":
    main()