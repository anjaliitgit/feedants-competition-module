# Manual Test Cases

| # | Test | Expected |
|---|---|---|
| 1 | Open competition | Dynamic details render |
| 2 | Login with valid credentials | JWT returned |
| 3 | Login with invalid password | 401 |
| 4 | Register while spots exist | Registration succeeds |
| 5 | Register twice | 409 duplicate |
| 6 | Register when full | 409 |
| 7 | Register after deadline | 409 |
| 8 | Countdown | Changes every second |
| 9 | Open tabs | Content changes |
| 10 | Submit without registration | 403 |
| 11 | Submit outside window | 409 |
| 12 | Submit registered user | Submission created |
| 13 | Add review | Review appears |
| 14 | Fetch reviews | Average rating returned |
| 15 | Concurrent registrations | Capacity is not exceeded |
