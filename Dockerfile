FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt /app
RUN export PKGS="build-essential libpq-dev gcc" && \
    apt-get update && apt-get install -y --no-install-recommends $PKGS && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y --auto-remove $PKGS

COPY . /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
CMD [ "python", "app.py" ]
