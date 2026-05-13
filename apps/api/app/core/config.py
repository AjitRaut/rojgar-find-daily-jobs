from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Rojgar Find – Daily Jobs"
    env: str = "development"
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    openai_api_key: str = ""
    # Comma-separated origins, e.g. "http://localhost:3000,https://app.example.com"
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()


def cors_origin_list() -> list[str]:
    return [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
