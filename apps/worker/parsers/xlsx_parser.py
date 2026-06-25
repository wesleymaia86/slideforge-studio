"""Excel / XLSX parser using pandas + openpyxl."""
import io
from typing import Any

import pandas as pd

from .base import ParseResult, _dtype_str


def parse_xlsx(data: bytes, preview_rows: int = 20) -> ParseResult:
    xlsx = pd.ExcelFile(io.BytesIO(data), engine="openpyxl")
    sheet_names = xlsx.sheet_names

    all_rows = 0
    all_cols = 0
    combined_schema: list[dict[str, Any]] = []
    combined_preview: list[dict[str, Any]] = []

    for sheet in sheet_names:
        df = xlsx.parse(sheet)
        all_rows += len(df)
        all_cols = max(all_cols, len(df.columns))

        for col in df.columns:
            sample = df[col].dropna().head(5).tolist()
            combined_schema.append(
                {
                    "name": str(col),
                    "dtype": _dtype_str(df[col].dtype),
                    "nullable": bool(df[col].isna().any()),
                    "sampleValues": [str(v) for v in sample],
                    "sheet": sheet,
                }
            )

        for _, row in df.head(preview_rows).iterrows():
            combined_preview.append({str(k): (None if pd.isna(v) else v) for k, v in row.items()})

    return ParseResult(
        row_count=all_rows,
        column_count=all_cols,
        sheet_names=sheet_names,
        schema=combined_schema,
        preview=combined_preview[:preview_rows],
    )
