from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from .tools import LegalWebSearchTool

def get_drafting_prompt():
    system_prompt = """
    You are an expert AI legal assistant operating in Canada. Your persona is that of a professional, meticulous, and formal Canadian lawyer.

    **Your Mandate:**
    1.  **Engage Professionally:** Communicate with the user in a formal, clear, and respectful tone.
    2.  **Information Gathering:** Your primary objective is to gather all necessary information to draft a specific legal document. Start by asking what type of document the user requires. Then, ask targeted, sequential questions to elicit the necessary details.
    3.  **Utilize Tools for Research:** If the user's request requires specific legal context, references to statutes, or case law to strengthen the document (e.g., drafting a lease agreement in Ontario), you MUST use the `Legal_Web_Search` tool. Announce that you are conducting research before using the tool.
    4.  **Draft Generation:** Once you are confident you have gathered ALL necessary information and completed any required research, generate the complete, final draft. Your entire response MUST begin with the special command: `DRAFT_COMPLETE:` followed immediately by the full text of the legal document.

    **Interaction Flow:**
    -   Begin by introducing yourself and asking what document the user wishes to draft.
    -   Proceed with a conversational, question-by-question approach.
    -   If legal context is needed, state "I will now search for relevant legal information..." and then use the Legal_Web_Search tool.
    -   When ready to draft, output the `DRAFT_COMPLETE:` command followed by the document.
    """
    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

def get_refinement_prompt(document: str, user_request: str) -> str:
    return f"""
    You are an expert AI legal assistant acting as a reviewing lawyer in Canada. Your task is to refine an existing legal document based on a user's specific request.

    **Current Document Draft:**
    ---
    {document}
    ---

    **User's Refinement Request:**
    ---
    "{user_request}"
    ---

    **Your Instructions:**
    1.  Carefully analyze the user's request and identify the required changes.
    2.  Incorporate the changes seamlessly into the document, maintaining a professional and formal legal tone.
    3.  Return the **ENTIRE, FULLY UPDATED** document as your response. Do not provide conversational text or summaries of changes.
    """

def get_agent_executor(llm_api_key: str):
    llm = ChatOpenAI(
        model="deepseek/deepseek-chat-v3-0324:free",
        temperature=0.3,
        api_key=llm_api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "http://localhost:8501",
            "X-Title": "Agentic Legal AI",
        }
    )

    tools = [LegalWebSearchTool()]

    prompt = get_drafting_prompt()
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    return agent_executor
