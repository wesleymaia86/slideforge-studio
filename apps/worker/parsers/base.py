"""Base parser contract."""
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ParseResult:
    row_count: int
    column_count: int
    sheet_names: list[str]
    schema: list[dict[str, Any]]
    preview: list[dict[str, Any]]


def _dtype_str(dtype: Any) -> str:
    name = str(dtype)
    if "int" in name:
        return "integer"
    if "float" in name:
        return "float"
    if "bool" in name:
        return "boolean"
    if "datetime" in name:
        return "datetime"
    return "string"
