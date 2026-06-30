# Backend Priority Checklist

## 1. First goal
The first goal is to make sure the Spring Boot backend starts without errors and that login works.

## 2. Run order
1. Open the `battery-mes-backend` project in Eclipse.
2. Run `battery-mes-backend` with `Run As > Spring Boot App`.
3. Wait for the log line similar to `Started BatteryMesApplication`.
4. If the server starts, test login first.
5. After login succeeds, test the main read APIs in this order:
   - `GET /api/lots`
   - `GET /api/work-orders`
   - `GET /api/equipment`
   - `GET /api/inspections`
   - `GET /api/defects`
   - `GET /api/dashboard/kpis`

## 3. Default test accounts
These users are created automatically at startup if they do not already exist.

- ADMIN
  - email: `admin@battery-mes.com`
  - password: `Admin123!`
- OPERATOR
  - email: `operator@battery-mes.com`
  - password: `Operator123!`
- INSPECTOR
  - email: `inspector@battery-mes.com`
  - password: `Inspector123!`

## 4. Login request
- URL: `POST http://localhost:8080/auth/login`
- Body:

```json
{
  "email": "admin@battery-mes.com",
  "password": "Admin123!"
}
```

## 5. What to copy after login
Copy the `accessToken` value from the login response.
Use this header for protected APIs:

```text
Authorization: Bearer <accessToken>
```

## 6. Main success criteria
Backend first is considered stable when all of these are true.

- The server starts without Oracle or Security errors.
- Login returns `accessToken` and `refreshToken`.
- `GET /api/lots` returns data.
- `GET /api/work-orders` returns data.
- `GET /api/equipment` returns data.

## 7. If an error happens
- `ORA-12514`: Oracle service name is wrong.
- `ORA-01017`: Oracle username or password is wrong.
- `403 Forbidden`: role mismatch or token missing.
- `401 Unauthorized`: invalid or missing JWT token.
- `table or view does not exist`: connected account does not own the tables.