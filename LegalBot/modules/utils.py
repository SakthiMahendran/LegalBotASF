import io
from docx import Document
from fpdf import FPDF


def create_docx(content: str) -> io.BytesIO:
    """Creates a DOCX file in memory from a string."""
    document = Document()
    document.add_paragraph(content)

    buffer = io.BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer


def create_pdf(content: str) -> io.BytesIO:
    """Creates a PDF file in memory from a string."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Encode content to latin-1, which is what FPDF expects
    # Replace characters that can't be encoded
    encoded_content = content.encode("latin-1", "replace").decode("latin-1")

    pdf.multi_cell(0, 10, txt=encoded_content)

    buffer = io.BytesIO()
    # The output from pdf.output is already bytes, no need to encode again
    pdf_output = pdf.output(dest="S")
    buffer.write(pdf_output)
    buffer.seek(0)
    return buffer
