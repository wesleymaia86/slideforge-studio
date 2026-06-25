"""Basic insights generation from parsed data."""
from typing import Any

from parsers.base import ParseResult


def generate_insights(job_id: str, result: ParseResult) -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []

    # Insight: row count
    insights.append(
        {
            "jobId": job_id,
            "title": "Dataset size",
            "bodyMarkdown": f"Dataset contains **{result.row_count} rows** and **{result.column_count} columns**.",
            "severity": "INFO",
            "meta": {"rowCount": result.row_count, "columnCount": result.column_count},
        }
    )

    # Insight: nullable columns
    nullable_cols = [c["name"] for c in result.schema if c.get("nullable")]
    if nullable_cols:
        pct = round(len(nullable_cols) / max(result.column_count, 1) * 100, 1)
        severity = "WARNING" if pct > 30 else "INFO"
        insights.append(
            {
                "jobId": job_id,
                "title": f"Missing values in {len(nullable_cols)} column(s)",
                "bodyMarkdown": (
                    f"**{len(nullable_cols)} column(s)** ({pct}% of total) contain null/missing values:\n"
                    + "\n".join(f"- `{c}`" for c in nullable_cols[:10])
                    + ("" if len(nullable_cols) <= 10 else f"\n- …and {len(nullable_cols)-10} more")
                ),
                "severity": severity,
                "meta": {"nullableColumns": nullable_cols},
            }
        )

    # Insight: numeric columns
    numeric_cols = [c["name"] for c in result.schema if c.get("dtype") in ("integer", "float")]
    if numeric_cols:
        insights.append(
            {
                "jobId": job_id,
                "title": f"{len(numeric_cols)} numeric column(s) detected",
                "bodyMarkdown": (
                    f"The following columns are numeric and suitable for charting:\n"
                    + "\n".join(f"- `{c}`" for c in numeric_cols[:10])
                ),
                "severity": "INFO",
                "meta": {"numericColumns": numeric_cols},
            }
        )

    # Insight: multiple sheets
    if len(result.sheet_names) > 1:
        insights.append(
            {
                "jobId": job_id,
                "title": f"Multiple sheets/sections ({len(result.sheet_names)})",
                "bodyMarkdown": (
                    "File contains multiple sheets:\n"
                    + "\n".join(f"- {s}" for s in result.sheet_names)
                ),
                "severity": "INFO",
                "meta": {"sheetNames": result.sheet_names},
            }
        )

    return insights
