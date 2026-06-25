"""HTTP client for callbacks to the NestJS API."""
from typing import Any

import httpx

from config import settings


def _headers() -> dict[str, str]:
    return {
        "x-worker-key": settings.worker_api_key,
        "Content-Type": "application/json",
    }


def update_job_progress(job_id: str, status: str, progress: int, error: str | None = None) -> None:
    payload: dict[str, Any] = {"jobId": job_id, "status": status, "progress": progress}
    if error:
        payload["errorMessage"] = error
    with httpx.Client(timeout=10) as client:
        client.post(
            f"{settings.worker_api_url}/internal/jobs/progress",
            json=payload,
            headers=_headers(),
        )


def save_parsed_artifact(
    job_id: str,
    row_count: int,
    column_count: int,
    sheet_names: list[str],
    schema: list[dict[str, Any]],
    preview: list[dict[str, Any]],
) -> None:
    payload = {
        "jobId": job_id,
        "rowCount": row_count,
        "columnCount": column_count,
        "sheetNames": sheet_names,
        "schema": schema,
        "preview": preview,
    }
    with httpx.Client(timeout=10) as client:
        client.post(
            f"{settings.worker_api_url}/internal/jobs/artifact",
            json=payload,
            headers=_headers(),
        )


def save_insights(insights: list[dict[str, Any]]) -> None:
    """Batch insight save — posts each insight individually (simplicity over perf here)."""
    with httpx.Client(timeout=10) as client:
        for insight in insights:
            client.post(
                f"{settings.worker_api_url}/internal/jobs/insights",
                json=insight,
                headers=_headers(),
            )
