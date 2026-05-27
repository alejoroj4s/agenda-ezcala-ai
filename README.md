# Agenda Ezcala AI — Motor de Agendamiento

Scheduling and calendar engine built with Next.js + React, matching Ezcala AI styles.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register, then use the calendar.

---

## API Reference for AI Agent

Base URL: `http://localhost:3000/api/v1`

**Auth:** `Authorization: Bearer {token}` header **or** `?token={token}` query param.

### Get your API token
1. Login → top-right avatar → **API Tokens** → **New Token**

---

### 🔍 Check Availability

```bash
curl "http://localhost:3000/api/v1/availability?service_id=SERVICE_ID&date=2025-06-15&token=YOUR_TOKEN"
```

Response:
```json
{ "slots": [{ "start": "2025-06-15T09:00:00.000Z", "end": "2025-06-15T10:00:00.000Z" }] }
```

---

### 📋 List Events

```bash
curl "http://localhost:3000/api/v1/events?from=2025-06-01&to=2025-06-30&token=YOUR_TOKEN"
# Filter by status: SCHEDULED | COMPLETED | CANCELLED | NO_SHOW
curl "http://localhost:3000/api/v1/events?status=SCHEDULED&service_id=SVC_ID&token=YOUR_TOKEN"
```

---

### ➕ Create Event

```bash
curl -X POST "http://localhost:3000/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Consultation with John",
    "service_id": "SERVICE_ID",
    "start_time": "2025-06-15T09:00:00.000Z",
    "end_time": "2025-06-15T10:00:00.000Z",
    "attendee_name": "John Doe",
    "attendee_email": "john@example.com",
    "attendee_phone": "+1234567890",
    "notes": "First consultation"
  }'
```

---

### 🔄 Reschedule Event

```bash
curl -X PUT "http://localhost:3000/api/v1/events/EVENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Consultation with John",
    "service_id": "SERVICE_ID",
    "start_time": "2025-06-16T10:00:00.000Z",
    "end_time": "2025-06-16T11:00:00.000Z",
    "attendee_name": "John Doe",
    "attendee_email": "john@example.com"
  }'
```

---

### ❌ Cancel Event

```bash
curl -X PATCH "http://localhost:3000/api/v1/events/EVENT_ID/cancel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 🗑️ Delete Event

```bash
curl -X DELETE "http://localhost:3000/api/v1/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 📌 Get Single Event

```bash
curl "http://localhost:3000/api/v1/events/EVENT_ID?token=YOUR_TOKEN"
```

---

### 🛠️ List Services

```bash
curl "http://localhost:3000/api/v1/services?token=YOUR_TOKEN"
```

---

### 👤 Get Current User

```bash
curl "http://localhost:3000/api/v1/me?token=YOUR_TOKEN"
```

---

## URL Token Access

Any page works via token in the URL:
```
http://localhost:3000/calendar?token=YOUR_TOKEN
```

---

## Event Status Values

| Status | Description |
|--------|-------------|
| `SCHEDULED` | Default — event is booked |
| `COMPLETED` | Event was completed |
| `CANCELLED` | Event was cancelled |
| `NO_SHOW` | Attendee did not show up |

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
```
