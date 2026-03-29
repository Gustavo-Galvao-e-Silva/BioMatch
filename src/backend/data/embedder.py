from typing import Protocol, runtime_checkable


@runtime_checkable
class Embedder(Protocol):
    def embed(self, text: str) -> list[float]: ...
    @property
    def dimension(self) -> int: ...


class LocalEmbedder:
    _MODEL_ID = "all-MiniLM-L6-v2"
    _DIM = 384

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(self._MODEL_ID)

    def embed(self, text: str) -> list[float]:
        return self._model.encode(text, convert_to_numpy=True).tolist()

    @property
    def dimension(self) -> int:
        return self._DIM


def get_embedder(provider: str = "local") -> Embedder:
    if provider == "local":
        return LocalEmbedder()
    raise ValueError(f"Unknown embedding provider {provider!r}. Choose 'local' or 'openai'.")
