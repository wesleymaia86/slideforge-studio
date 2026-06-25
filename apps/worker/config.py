from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    redis_url: str = "redis://localhost:6379"
    worker_api_url: str = "http://localhost:3000/api/v1"
    worker_api_key: str = "internal-worker-secret"

    s3_endpoint: str = "http://localhost:9000"
    s3_region: str = "us-east-1"
    s3_bucket: str = "slideforge-assets"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"


settings = Settings()
