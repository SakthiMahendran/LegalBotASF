# LegalBot

AI-powered legal document generation application built with Streamlit.

## Project Structure

```
LegalBot/
├── app.py              # Main Streamlit application
├── modules/            # Core application modules
│   ├── agent.py       # AI agent and prompts
│   ├── ui.py          # UI components and logic
│   ├── utils.py       # Document generation utilities
│   └── tools.py       # AI tools
├── docs/              # Documentation
├── tests/             # Test files
├── requirements.txt   # Python dependencies
└── .env              # Environment variables (not tracked)
```

## Setup

1. Create virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file with your API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. Run the application:
   ```bash
   streamlit run app.py
   ```

## Features

- AI-powered legal document generation
- Real-time document preview
- Document details extraction and verification
- Multiple document formats (DOCX, PDF)
- Theme support (light/dark)
- Session management

## Documentation

See the `docs/` folder for detailed documentation on features and improvements.