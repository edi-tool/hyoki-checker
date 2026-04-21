from .models import TextChunk

CHUNK_SIZE = 2000
OVERLAP = 200


def split_text(text: str) -> list[TextChunk]:
    """テキストを2,000文字チャンク（200文字オーバーラップ）に分割する。"""
    chunks: list[TextChunk] = []
    offset = 0
    chunk_id = 0

    while offset < len(text):
        end = min(offset + CHUNK_SIZE, len(text))
        # 段落境界で切る（改行を探す）
        if end < len(text):
            newline = text.rfind("\n", offset, end)
            if newline > offset:
                end = newline + 1

        chunks.append(TextChunk(
            id=chunk_id,
            text=text[offset:end],
            offset=offset,
        ))
        chunk_id += 1
        offset = max(offset + 1, end - OVERLAP)

    return chunks
