FROM python:3.11-slim

# Install system dependencies (ffmpeg is essential for audio decoding)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up user with UID 1000 for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Copy requirements and install
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend application code
COPY --chown=user:user . .

# Hugging Face Spaces standard port is 7860
ENV PORT=7860
EXPOSE 7860

# Start FastAPI uvicorn daemon
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
