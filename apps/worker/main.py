"""FastAPI app — health endpoint + Celery task submission API."""
from typing import Any

from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel

from celery_app import celery_app
from config import settings

app = FastAPI(title="SlideForge Worker", version="0.1.0")


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "worker"}


@app.get("/ready")
def ready() -> dict[str, Any]:
    checks: dict[str, str] = {}
    try:
        celery_app.control.ping(timeout=2)
        checks["celery"] = "ok"
    except Exception:
        checks["celery"] = "error"

    try:
        import redis as redis_lib
        r = redis_lib.from_url(settings.redis_url)
        r.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "error"

    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ok" if all_ok else "degraded", "checks": checks}


# ─── Task submission (internal) ────────────────────────────────────────────────

class ProcessFilePayload(BaseModel):
    jobId: str
    fileAssetId: str
    workspaceId: str
    storageKey: str
    mimeType: str
    originalName: str


def _verify_worker_key(x_worker_key: str = Header(...)) -> None:
    if x_worker_key != settings.worker_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid worker key")


@app.post("/tasks/process-file", status_code=status.HTTP_202_ACCEPTED)
def submit_process_file(
    payload: ProcessFilePayload,
    x_worker_key: str = Header(...),
) -> dict[str, str]:
    _verify_worker_key(x_worker_key)
    from tasks import process_file
    task = process_file.apply_async(args=[payload.model_dump()], queue="processing")
    return {"taskId": task.id, "jobId": payload.jobId, "status": "queued"}


@app.get("/tasks/{task_id}")
def get_task_status(task_id: str, x_worker_key: str = Header(...)) -> dict[str, Any]:
    _verify_worker_key(x_worker_key)
    result = celery_app.AsyncResult(task_id)
    return {
        "taskId": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None,
    }
