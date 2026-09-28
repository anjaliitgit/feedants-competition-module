# API Reference

Base URL: `http://localhost:5000/api`

## POST /auth/register

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Password@123"
}
```

## POST /auth/login

```json
{
  "email": "demo@feedants.local",
  "password": "Demo@123"
}
```

Returns:

```json
{
  "token": "...",
  "user": {
    "_id": "...",
    "name": "Demo User",
    "email": "demo@feedants.local"
  }
}
```

## GET /competitions/:id

Returns the complete competition details required by the mobile screen.

## POST /competitions/:id/register

Requires:

```text
Authorization: Bearer <JWT>
```

The server validates lifecycle, deadline, capacity and duplicate registration.

## GET /competitions/:id/registration/me

Returns the current user's registration state.

## POST /competitions/:id/submissions

Multipart request:

```text
file=<video/file>
title=<submission title>
description=<optional description>
```

The server validates registration and the submission window.

## GET /competitions/:id/reviews

Returns reviews and average rating.

## POST /competitions/:id/reviews

```json
{
  "rating": 5,
  "comment": "Great competition experience."
}
```
