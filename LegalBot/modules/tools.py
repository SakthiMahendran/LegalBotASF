from langchain_community.tools import DuckDuckGoSearchRun
from langchain.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class LegalSearchInput(BaseModel):
    query: str = Field(description="A detailed search query to find information on Canadian legal topics.")

class LegalWebSearchTool(BaseTool):
    name: str = "Legal_Web_Search"
    description: str = "Use this tool to search the web for Canadian legal information, including statutes and case law. It is focused on official government and legal institute sources."
    args_schema: Type[BaseModel] = LegalSearchInput

    def _run(self, query: str):
        """Executes the web search using DuckDuckGo."""
        # Append the site filter to the user's query
        scoped_query = f"{query} site:canlii.org OR site:justice.gc.ca"
        
        # Initialize the DuckDuckGo search tool
        ddg_search = DuckDuckGoSearchRun()
        
        try:
            results = ddg_search.run(scoped_query)
            return results
        except Exception as e:
            return f"An error occurred during the search: {e}"

    def _arun(self, query: str):
        raise NotImplementedError("LegalWebSearchTool does not support async")
