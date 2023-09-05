FROM python:3.9-alpine3.16


RUN apk add --no-cache gettext

COPY requirements.txt /temp/requirements.txt
COPY envirotrack /envirotrack
WORKDIR /envirotrack
EXPOSE 8000

RUN apk add postgresql-client build-base postgresql-dev

RUN pip install -r /temp/requirements.txt

RUN adduser --disabled-password service-user

USER service-user