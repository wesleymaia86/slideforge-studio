"""S3-compatible storage client for fetching files to process."""
import boto3
import botocore.config
from config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        region_name=settings.storage_region,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        config=botocore.config.Config(
            signature_version="s3v4",
            s3={"addressing_style": "path" if settings.storage_force_path_style else "auto"},
        ),
    )


def download_file(storage_key: str) -> bytes:
    client = get_s3_client()
    response = client.get_object(Bucket=settings.storage_bucket, Key=storage_key)
    return response["Body"].read()
