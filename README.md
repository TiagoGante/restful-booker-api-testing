# restful-booker-api-testing

An automated API test suite for [Restful-booker](https://restful-booker.herokuapp.com/apidoc/index.html), built with Playwright and TypeScript.

Restful-booker is a small hotel booking API made for people who want to practise testing. It's also full of bugs, on purpose. So this project is really two things: a test suite built the way I'd build one at work, and a list of everything I caught the API doing wrong.

## What's tested

52 tests, covering authentication and the full booking CRUD.

| Endpoint              | What it does                   | Tests |
| --------------------- | ------------------------------ | ----- |
| `POST /auth`          | Get a token                    | 6     |
| `GET /booking`        | List booking ids, with filters | 6     |
| `GET /booking/:id`    | Get one booking                | 7     |
| `POST /booking`       | Create a booking               | 12    |
| `PUT /booking/:id`    | Update a booking               | 15    |
| `DELETE /booking/:id` | Delete a booking               | 6     |

Every endpoint gets its happy path, plus the things that tend to break APIs: missing fields, wrong types, malformed JSON, no token, a fake token, and ids that don't exist.

## Running it

You'll need Node.js 20 or newer.

```bash
npm ci
npm test              # everything
npm run test:smoke    # only the @smoke tests, done in a couple of seconds
npm run report        # open the HTML report
```

There are no browsers to install. These are API tests, so Playwright never opens one.

By default the tests run against the public instance with the public demo credentials. To point them somewhere else:

```bash
BASE_URL=http://localhost:3001 API_USERNAME=admin API_PASSWORD=secret npm test
```

The suite also runs on GitHub Actions for every push and pull request, and the HTML report is uploaded as a build artifact.

## How it's organized

```
tests/
├── specs/       the tests themselves, one file per endpoint
├── requests/    thin API clients (AuthRequest, BookingRequest)
├── fixtures/    hands those clients to each test
├── contracts/   Joi schemas for the response bodies
├── data/        credentials and a Faker-based booking builder
└── docs/        an example bug report
```

The one rule I stuck to: **specs say what, requests say how.** A spec reads like `bookingRequest.updateBooking(id, booking, token)` and never needs to know that the token travels in a cookie.

The request layer also never asserts anything. It hands back the raw response and lets each test decide what "correct" means. That's the only way the negative tests can work.

## Things I tried to get right

- **Tests make their own data.** The API is public and shared, so booking #6 might belong to someone else, or be gone tomorrow. Each test creates a booking with a random name, uses it, and deletes it in `afterEach`, which runs even when the test fails.
- **Checking the body, not just the status code.** Successful responses are validated against a Joi schema and compared with what was sent. A `200` with the wrong price is still a bug.
- **Checking side effects.** After an update, a `GET` confirms the change was actually saved. After a rejected update or delete (`403`), a `GET` confirms that nothing changed. A `403` that still deletes your booking would be much worse than a wrong status code.
- **Table-driven negative tests.** Invalid inputs live in small lists, one row per case, so adding a new case is one line.
- **Known bugs stay visible.** When the API gets something wrong, the test either asserts the current behavior with a `Known issue` comment, or uses `test.fail()` to assert the _correct_ behavior. The `test.fail()` ones turn red the day the bug is fixed, which is the cue to clean them up.

## Bugs I found

This is the fun part.

**Authentication**

- Wrong password? `200 OK`. The only hint that something went wrong is `{"reason":"Bad credentials"}` in the body. It should be a `401`.

**Reading bookings**

- `GET /booking/4464.5` happily returns booking 4464, because decimal ids just get rounded down. This one has a [full bug report](tests/docs/bug-report-example.md).
- A filter like `?checkin=not-a-date` crashes the server with a `500`.

**Creating bookings**

- Leave out a required field and you get a `500` instead of a `400`.
- Send the wrong kind of value and it's accepted anyway:
  - `"totalprice": "abc"` is saved as `null`
  - `"totalprice": -50` is a perfectly fine price, apparently
  - `"totalprice": 99.99` is saved as `99`. Bye, 99 cents.
  - `"depositpaid": "yes"` becomes `true`
  - `"checkin": "not-a-date"` is saved as `"0NaN-aN-aN"`, my personal favorite
  - checking out before you've checked in is no problem at all

**Updating bookings**

- `PUT` is supposed to replace the whole booking. Leave out `additionalneeds` and the old value just stays, so it really behaves like a `PATCH`.
- Updating a booking that doesn't exist returns `405 Method Not Allowed`. It should be a `404`.

**Deleting bookings**

- A successful delete returns `201 Created`. Nothing was created.
- Deleting a booking that's already gone returns `405`, again instead of a `404`.

## Stack

Playwright Test · TypeScript · Joi · Faker · GitHub Actions
