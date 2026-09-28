# Architecture

## Request flow

```text
React Native
    |
    | HTTPS/JSON
    v
Express API
    |
    +--> Auth middleware / JWT
    |
    +--> Validation
    |
    +--> Controllers
    |
    +--> Services / business rules
    |
    v
MongoDB
```

## Registration consistency

Registration uses a transaction and an atomic conditional update:

```text
status = registration_open
deadline > now
registeredCount < maxParticipants
        |
        v
$inc registeredCount by 1
        |
        v
create unique registration
```

This avoids overselling the last available slot and prevents duplicate registration through a unique compound index.

## Frontend state machine

```text
UPCOMING
   |
   v
REGISTRATION OPEN
   | \
   |  \ full / deadline
   |   \
   v    v
REGISTERED   REGISTRATION CLOSED
   |
   v
SUBMISSION WINDOW
   |
   v
COMPLETED
```
