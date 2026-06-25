"""S3-compatible storage client for fetching files to process."""
import boto3
import botocore
from config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=botocore.config.Config(signature_version="s3v4"),
    )


def download_file(storage_key: str) -> bytes:
    client = get_s3_client()
    response = client.get_object(Bucket=settings.s3_bucket, Key=storage_key)
    return response["Body"].read()
