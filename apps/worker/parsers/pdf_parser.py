"""PDF text extraction using pypdf."""
import io

from pypdf import PdfReader

from .base import ParseResult


def parse_pdf(data: bytes, preview_rows: int = 20) -> ParseResult:
    reader = PdfReader(io.BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages]
    total_chars = sum(len(p) for p in pages)

    schema = [
        {"name": f"page_{i+1}", "dtype": "string", "nullable": not p, "sampleValues": [p[:100]]}
        for i, p in enumerate(pages)
    ]

    preview = [
        {"page": i + 1, "text_snippet": p[:500], "char_count": len(p)}
        for i, p in enumerate(pages[:preview_rows])
    ]

    return ParseResult(
        row_count=len(pages),
        column_count=1,
        sheet_names=["Pages"],
        schema=schema,
        preview=preview,
    )
