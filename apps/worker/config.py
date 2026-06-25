from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    redis_url: str = "redis://localhost:6379"
    worker_api_url: str = "http://localhost:3001/api/v1"
    worker_api_key: str = "internal-worker-secret"

    # S3 storage — align with apps/api env vars
    storage_endpoint: str = "http://localhost:9000"
    storage_region: str = "us-east-1"
    storage_bucket: str = "slideforge-uploads"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_force_path_style: bool = True


settings = Settings()
