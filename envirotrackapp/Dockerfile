FROM python:3.9-alpine3.16

WORKDIR /envirotrack

RUN apk add --no-cache gettext postgresql-client build-base postgresql-dev \
    && adduser --disabled-password service-user

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY envirotrack /envirotrack

USER service-user

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]