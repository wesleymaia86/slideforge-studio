"""CSV parser using pandas."""
import io
from typing import Any

import pandas as pd

from .base import ParseResult, _dtype_str


def parse_csv(data: bytes, preview_rows: int = 20) -> ParseResult:
    df = pd.read_csv(io.BytesIO(data))

    schema: list[dict[str, Any]] = []
    for col in df.columns:
        sample = df[col].dropna().head(5).tolist()
        schema.append(
            {
                "name": str(col),
                "dtype": _dtype_str(df[col].dtype),
                "nullable": bool(df[col].isna().any()),
                "sampleValues": [str(v) for v in sample],
            }
        )

    preview: list[dict[str, Any]] = []
    for _, row in df.head(preview_rows).iterrows():
        preview.append({str(k): (None if pd.isna(v) else v) for k, v in row.items()})

    return ParseResult(
        row_count=len(df),
        column_count=len(df.columns),
        sheet_names=["Sheet1"],
        schema=schema,
        preview=preview,
    )
