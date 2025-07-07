#!/usr/bin/env python3
"""
LegalBot API Usage Examples
Complete workflow examples for the LegalBot Django API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

class LegalBotAPI:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
    
    def register(self, username, email, password):
        """Register a new user"""
        response = self.session.post(f"{self.base_url}/api/auth/register/", json={
            "username": username,
            "email": email,
            "password": password
        })
        return response.json() if response.status_code == 201 else None
    
    def login(self, email, password):
        """Login and store access token"""
        response = self.session.post(f"{self.base_url}/api/auth/login/", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            tokens = response.json()
            self.access_token = tokens['access']
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
            return tokens
        return None
    
    def create_session(self, title, status="drafting"):
        """Create a new chat session"""
        response = self.session.post(f"{self.base_url}/api/sessions/", json={
            "title": title,
            "status": status
        })
        return response.json() if response.status_code == 201 else None
    
    def send_message(self, session_id, role, content):
        """Send a message in a session"""
        response = self.session.post(f"{self.base_url}/api/messages/", json={
            "session": session_id,
            "role": role,
            "content": content
        })
        return response.json() if response.status_code == 201 else None
    
    def generate_document(self, prompt, conversation_history=None):
        """Generate a legal document using AI"""
        response = self.session.post(f"{self.base_url}/api/ai/generate/", json={
            "prompt": prompt,
            "conversation_history": conversation_history or []
        })
        return response.json() if response.status_code == 200 else None
    
    def refine_document(self, current_draft, user_request):
        """Refine an existing document"""
        response = self.session.post(f"{self.base_url}/api/ai/refine/", json={
            "current_draft": current_draft,
            "user_request": user_request
        })
        return response.json() if response.status_code == 200 else None
    
    def extract_details(self, conversation_history):
        """Extract document details from conversation"""
        response = self.session.post(f"{self.base_url}/api/ai/extract-details/", json={
            "conversation_history": conversation_history
        })
        return response.json() if response.status_code == 200 else None
    
    def create_document(self, session_id, document_type, content):
        """Create a document record"""
        response = self.session.post(f"{self.base_url}/api/documents/", json={
            "session": session_id,
            "document_type": document_type,
            "content": content
        })
        return response.json() if response.status_code == 201 else None
    
    def download_document(self, document_id, format_type="docx"):
        """Download document in specified format"""
        response = self.session.get(
            f"{self.base_url}/api/documents/{document_id}/download/?format={format_type}"
        )
        return response.content if response.status_code == 200 else None

def example_complete_workflow():
    """Example of complete legal document generation workflow"""
    api = LegalBotAPI()
    
    # 1. Register user (optional if already registered)
    print("1. Registering user...")
    user = api.register("testuser", "test@example.com", "testpass123")
    print(f"User registered: {user}")
    
    # 2. Login
    print("\n2. Logging in...")
    tokens = api.login("test@example.com", "testpass123")
    print(f"Login successful: {bool(tokens)}")
    
    # 3. Create session
    print("\n3. Creating session...")
    session = api.create_session("Property Transfer Agreement")
    session_id = session['id']
    print(f"Session created: {session_id}")
    
    # 4. Start conversation
    print("\n4. Starting conversation...")
    conversation = []
    
    # User message
    user_msg = "I need a property transfer agreement between John Smith and Jane Doe"
    api.send_message(session_id, "user", user_msg)
    conversation.append({"role": "user", "content": user_msg})
    
    # AI response
    ai_response = api.generate_document(user_msg, conversation)
    ai_content = ai_response['result']
    api.send_message(session_id, "assistant", ai_content)
    conversation.append({"role": "assistant", "content": ai_content})
    
    print(f"AI Response: {ai_content[:100]}...")
    
    # 5. Continue conversation for more details
    print("\n5. Gathering more details...")
    user_msg2 = "The property is located at 123 Main Street, Toronto, and the transfer date is October 15, 2024"
    api.send_message(session_id, "user", user_msg2)
    conversation.append({"role": "user", "content": user_msg2})
    
    # Generate final document
    final_response = api.generate_document(user_msg2, conversation)
    final_content = final_response['result']
    
    if "DRAFT_COMPLETE:" in final_content:
        document_content = final_content.replace("DRAFT_COMPLETE:", "").strip()
        print("Document generation complete!")
        
        # 6. Create document record
        print("\n6. Creating document record...")
        document = api.create_document(
            session_id, 
            "Property Transfer Agreement", 
            document_content
        )
        document_id = document['id']
        print(f"Document created: {document_id}")
        
        # 7. Extract details
        print("\n7. Extracting document details...")
        details = api.extract_details(conversation)
        print(f"Extracted details: {details}")
        
        # 8. Download document
        print("\n8. Downloading document...")
        docx_content = api.download_document(document_id, "docx")
        if docx_content:
            with open("property_transfer.docx", "wb") as f:
                f.write(docx_content)
            print("Document saved as property_transfer.docx")
        
        pdf_content = api.download_document(document_id, "pdf")
        if pdf_content:
            with open("property_transfer.pdf", "wb") as f:
                f.write(pdf_content)
            print("Document saved as property_transfer.pdf")
    
    print("\n✅ Workflow completed successfully!")

def example_document_refinement():
    """Example of document refinement workflow"""
    api = LegalBotAPI()
    
    # Login (assuming user exists)
    api.login("test@example.com", "testpass123")
    
    sample_draft = """
    PROPERTY TRANSFER AGREEMENT
    
    This agreement is made between John Smith and Jane Doe
    for the transfer of property located at 123 Main Street.
    """
    
    # Refine the document
    refined = api.refine_document(
        sample_draft,
        "Please add the date as October 15, 2024 and change the address to 456 Oak Avenue"
    )
    
    print("Original draft:")
    print(sample_draft)
    print("\nRefined document:")
    print(refined['result'])

if __name__ == "__main__":
    print("🚀 LegalBot API Examples")
    print("=" * 50)
    
    try:
        example_complete_workflow()
        print("\n" + "=" * 50)
        example_document_refinement()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Make sure the Django server is running:")
        print("python manage.py runserver")
