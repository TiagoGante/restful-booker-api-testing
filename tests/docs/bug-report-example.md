[BUG] GET /booking/:id accepts decimal ids and returns the truncated booking

## Summary

`GET /booking/:id` accepts a decimal id (e.g. `4464.5`) and returns the booking with the truncated id (`4464`) instead of rejecting the request.

## Environment

- **QUALITY**
- **Endpoint:** `GET /booking/:id`

## Steps to reproduce

1. Create a booking with `POST /booking` and note the returned `bookingid` (e.g. `4464`)
2. Send `GET /booking/4464.5` with the header `Accept: application/json`

## Expected result

`404 Not Found`. The value is not a valid booking id.

## Actual result

`200 OK` with the body of booking `4464`.

## Evidence curl

GET /booking/4464.5
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"firstname":"Ana","lastname":"Silva","totalprice":100,"depositpaid":true,
"bookingdates":{"checkin":"2026-10-01","checkout":"2026-10-05"},
"additionalneeds":"Breakfast"}

## Severity / Priority

- **Severity:** Minor. No data is corrupted and the returned booking exists, but the id is not validated before parsing.
- **Priority:** Low
