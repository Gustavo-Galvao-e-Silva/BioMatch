from typing import Protocol, runtime_checkable


@runtime_checkable
class Embedder(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...
    @property
    def dimension(self) -> int: ...


class LocalEmbedder:
    _MODEL_ID = "all-MiniLM-L6-v2"
    _DIM = 384

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(self._MODEL_ID)

    def embed(self, texts: list[str]) -> list[list[float]]:
        return self._model.encode(texts, convert_to_numpy=True).tolist()

    @property
    def dimension(self) -> int:
        return self._DIM


class OpenAIEmbedder:
    _MODEL_ID = "text-embedding-3-small"
    _DIM = 1536

    def __init__(self, api_key: str | None = None) -> None:
        import os
        from openai import OpenAI
        key = api_key or os.environ.get("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY required for OpenAIEmbedder")
        self._client = OpenAI(api_key=key)

    def embed(self, texts: list[str]) -> list[list[float]]:
        response = self._client.embeddings.create(model=self._MODEL_ID, input=texts)
        return [item.embedding for item in response.data]

    @property
    def dimension(self) -> int:
        return self._DIM


def get_embedder(provider: str = "local") -> Embedder:
    if provider == "local":
        return LocalEmbedder()
    if provider == "openai":
        return OpenAIEmbedder()
    raise ValueError(f"Unknown embedding provider {provider!r}. Choose 'local' or 'openai'.")
