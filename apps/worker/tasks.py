"""Celery tasks for file processing."""
import logging
from typing import Any

from celery_app import celery_app
from api_client import update_job_progress, save_parsed_artifact, save_insights
from storage_client import download_file
from insights_generator import generate_insights
from parsers.base import ParseResult

logger = logging.getLogger(__name__)

SUPPORTED_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xlsx",
    "text/csv": "csv",
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


def _parse(file_bytes: bytes, mime_type: str, original_name: str) -> ParseResult:
    file_type = SUPPORTED_MIME_TYPES.get(mime_type)
    if not file_type:
        # Fallback: infer from extension
        ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
        file_type = ext if ext in ("xlsx", "csv", "pdf", "docx") else None

    if file_type == "xlsx":
        from parsers.xlsx_parser import parse_xlsx
        return parse_xlsx(file_bytes)
    if file_type == "csv":
        from parsers.csv_parser import parse_csv
        return parse_csv(file_bytes)
    if file_type == "pdf":
        from parsers.pdf_parser import parse_pdf
        return parse_pdf(file_bytes)
    if file_type == "docx":
        from parsers.docx_parser import parse_docx
        return parse_docx(file_bytes)

    raise ValueError(f"Unsupported file type: {mime_type} ({original_name})")


@celery_app.task(
    name="tasks.process_file",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def process_file(self, payload: dict[str, Any]) -> dict[str, Any]:
    job_id: str = payload["jobId"]
    storage_key: str = payload["storageKey"]
    mime_type: str = payload["mimeType"]
    original_name: str = payload["originalName"]

    logger.info("Processing job %s | file: %s", job_id, original_name)

    try:
        update_job_progress(job_id, "PROCESSING", 10)

        file_bytes = download_file(storage_key)
        update_job_progress(job_id, "PROCESSING", 30)

        result = _parse(file_bytes, mime_type, original_name)
        update_job_progress(job_id, "PROCESSING", 70)

        save_parsed_artifact(
            job_id=job_id,
            row_count=result.row_count,
            column_count=result.column_count,
            sheet_names=result.sheet_names,
            schema=result.schema,
            preview=result.preview,
        )
        update_job_progress(job_id, "PROCESSING", 85)

        insights = generate_insights(job_id, result)
        save_insights(insights)

        update_job_progress(job_id, "DONE", 100)
        logger.info("Job %s completed successfully", job_id)
        return {"jobId": job_id, "status": "DONE"}

    except Exception as exc:
        logger.error("Job %s failed: %s", job_id, exc, exc_info=True)
        try:
            update_job_progress(job_id, "FAILED", 0, error=str(exc))
        except Exception:
            pass
        raise self.retry(exc=exc)
