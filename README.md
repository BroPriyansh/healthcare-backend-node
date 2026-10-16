# Healthcare Backend API (Node.js)

A REST API for user authentication, patient records, doctor records, and patient–doctor assignments. Built with Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt, Zod validation, Helmet, and rate limiting.

## Requirements

- Node.js 20+ (Node 22 is fine)
- npm
- PostgreSQL 14+ running locally
- Postman (or another REST client)

## 1. Create the database

Open PowerShell or a terminal where `psql` is available:

```sql
CREATE DATABASE healthcare_db;
```

Then run the schema against that database:

**PowerShell**
```powershell
psql -U postgres -d healthcare_db -f database/schema.sql
```

**macOS/Linux/WSL**
```bash
psql -U postgres -d healthcare_db -f database/schema.sql
```

If `psql` is not on PATH, open pgAdmin, select `healthcare_db`, open Query Tool, and execute `database/schema.sql`.

## 2. Configure environment

Copy `.env.example` to `.env`, then edit `.env`:
- Set `DATABASE_URL` to your PostgreSQL username, password, host, port, and database.
- Replace both JWT secrets with different random values of at least 32 characters.
- Never commit `.env` or share real secrets.

Example URL:
`postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthcare_db`

If your PostgreSQL password contains URL-reserved characters such as `@`, encode them in the URL (for example `@` becomes `%40`) or use a password without reserved characters for local development.

## 3. Install and run

From the project root:

```bash
npm install
npm run dev
```

Expected startup logs:
```text
Connected to PostgreSQL.
Healthcare API listening on http://localhost:3000
```

Check `GET http://localhost:3000/api/health`; expected response:
```json
{"status":"ok","service":"healthcare-api"}
```

## API reference

An OpenAPI 3.0 specification is included at `docs/openapi.yaml` for review or import into compatible API tools.

All request bodies use JSON. Protected endpoints require this header:
`Authorization: Bearer YOUR_ACCESS_TOKEN`

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in; returns access and refresh JWTs |
| POST | `/api/auth/refresh` | Exchange refresh token for a new token pair |

Register:
```json
{"name":"Aarav Sharma","email":"aarav@example.com","password":"StrongPass123"}
```

Login:
```json
{"email":"aarav@example.com","password":"StrongPass123"}
```

### Patients (authenticated; scoped to the signed-in user)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/patients` | Create patient |
| GET | `/api/patients` | List your patients |
| GET | `/api/patients/:id` | Get your patient |
| PUT | `/api/patients/:id` | Replace patient fields |
| DELETE | `/api/patients/:id` | Delete your patient |

Patient JSON:
```json
{
  "name":"Meera Sharma",
  "age":34,
  "gender":"female",
  "address":"12 Park Street, Agra",
  "phone":"9876543210"
}
```
Allowed `gender`: `male`, `female`, `other`, `prefer_not_to_say`. `age` must be an integer from 0 to 130.

### Doctors (authenticated)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/:id` | Get doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |

Doctor JSON:
```json
{
  "name":"Dr. Riya Verma",
  "specialization":"Cardiology",
  "email":"riya.verma@example.com",
  "phone":"9876543211",
  "clinic_address":"Civil Lines, Agra"
}
```

### Patient–doctor mappings (authenticated)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/mappings` | Assign doctor to patient |
| GET | `/api/mappings` | List mappings for your patients |
| GET | `/api/mappings/:patient_id` | List doctors assigned to your patient |
| DELETE | `/api/mappings/:id` | Remove assignment |

Mapping JSON:
```json
{"patient_id":1,"doctor_id":1}
```

The required patient-specific mapping endpoint is implemented as `GET /api/mappings/:patient_id`. HTTP method matching allows this to coexist with `DELETE /api/mappings/:id`. A readable alias, `GET /api/mappings/patient/:patient_id`, is also available.

## Postman walkthrough

Import `postman/Healthcare-Backend.postman_collection.json` into Postman. The collection uses `baseUrl` and stores the `accessToken`, `refreshToken`, `patientId`, `doctorId`, and `mappingId` from responses automatically.

Recommended order:
1. Health Check
2. Register User
3. Login
4. Create Patient
5. List Patients
6. Get Patient
7. Update Patient
8. Create Doctor
9. List Doctors
10. Get Doctor
11. Update Doctor
12. Assign Doctor to Patient
13. List Mappings
14. Get Doctors for Patient
15. Remove Mapping
16. Delete Doctor
17. Delete Patient

Run each request once in order. Registration returns no token, so Login is needed before protected requests.

## Error responses

Errors follow a predictable shape:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "details": [{"field":"email","message":"Invalid email"}]
  }
}
```
- `400`: invalid body or references
- `401`: missing/invalid/expired token or invalid credentials
- `404`: record or route not found
- `409`: duplicate email, doctor, or assignment
- `500`: generic server error (details are logged server-side, not sent to clients)

## Automated tests

The Jest/Supertest test suite validates health, unknown routes, authentication enforcement, and request validation. It uses a mocked database and does not require a running PostgreSQL instance:

```bash
npm test
```

## Security notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- SQL uses parameterized queries to mitigate injection.
- JWT access and refresh tokens use separate secrets, issuer, audience, and token types.
- Patient reads/updates/deletes and mapping operations verify patient ownership.
- Helmet, JSON body size limits, and rate limiting are enabled.
- This is an assignment project, not a production-certified medical system. A real deployment needs a security review, audit logs, stricter role-based permissions, backups, and applicable healthcare privacy compliance.
