# HealthBot API Reference

Base URL: `http://localhost:8000`
Default Content-Type: `application/json`
Exception: Report Upload uses `multipart/form-data`

All error responses have this shape:

```json
{ "detail": "error message" }
```

---

## 1. Health Check

**GET** `/api/health`

| Status | When              |
| ------ | ----------------- |
| 200    | Server is running |

Response `200`:

```json
{ "status": "ok" }
```

---

## 2. Chat

**POST** `/api/chat`

Request body:

```json
{
  "message": "I have chest pain, I need to see a doctor",
  "session_id": "abc123"
}
```

| Field        | Type   | Required | Notes                                                                                                                 |
| ------------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `message`    | string | yes      | User message text                                                                                                     |
| `session_id` | string | no       | Defaults to `"default"` if omitted. Use a UUID per user session — backend keeps last 6 messages for multi-turn memory |

| Status | When                                |
| ------ | ----------------------------------- |
| 200    | Always — chat never throws an error |

Response `200` schema:

```json
{
  "reply": "string",
  "intent": "string",
  "data": null
}
```

| Field    | Type           | Notes                                                                               |
| -------- | -------------- | ----------------------------------------------------------------------------------- |
| `reply`  | string         | Bot's text reply to display in chat                                                 |
| `intent` | string         | Detected intent — see table below                                                   |
| `data`   | object or null | Populated only when `intent` is `book_appointment` or `set_reminder` with full data |

### Intent values

| `intent`             | `data`                 | What happened                                                               | UI action                                |
| -------------------- | ---------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| `book_appointment`   | **Appointment object** | All info collected, doctor matched, appointment created                     | Append `data` to appointments sidebar    |
| `cancel_appointment` | `null`                 | Bot attempted cancellation                                                  | Re-fetch `GET /api/appointments` to sync |
| `set_reminder`       | **Reminder object**    | Reminder created                                                            | Append `data` to reminders sidebar       |
| `set_reminder`       | `null`                 | Bot asking for missing medicine name                                        | Just show reply                          |
| `health_question`    | `null`                 | Health info answer                                                          | Just show reply                          |
| `general_chat`       | `null`                 | General reply or mid-flow collection (asking for symptoms, date, time etc.) | Just show reply                          |

> **Note:** When `intent` is `general_chat`, the bot may be actively collecting appointment info step by step (symptoms → doctor preference → date/time). Keep showing replies until `book_appointment` fires with `data`.

### Appointment booking flow (multi-turn)

The bot collects info one step at a time before booking:

1. Asks what health problem / symptoms
2. Suggests a matching specialist, confirms with user
3. Asks preferred date and time
4. Confirms summary
5. User confirms → `book_appointment` fires, doctor matched from 500-record database via vector search

### Response examples

`book_appointment` — doctor matched and appointment created:

```json
{
  "reply": "Done! Your appointment with Dr. Sarah Johnson (Cardiologist) is confirmed for 2024-04-15 at 10:30 AM. Location: 42 Oak St, Medical Center, New York, NY 10001. Contact: +1-212-555-0101.",
  "intent": "book_appointment",
  "data": {
    "id": "a1b2c3d4",
    "doctor": "Dr. Sarah Johnson",
    "specialty": "Cardiologist",
    "date": "2024-04-15",
    "time": "10:30 AM",
    "status": "confirmed",
    "contact": "+1-212-555-0101",
    "email": "sarah.johnson@medicalhealth.com",
    "location": "42 Oak St, Medical Center, New York, NY 10001"
  }
}
```

`general_chat` — bot collecting appointment info mid-flow:

```json
{
  "reply": "What health problem or symptoms are you experiencing?",
  "intent": "general_chat",
  "data": null
}
```

`cancel_appointment`:

```json
{
  "reply": "Your appointment has been cancelled.",
  "intent": "cancel_appointment",
  "data": null
}
```

`set_reminder` — reminder created:

```json
{
  "reply": "Reminder set! I'll remind you to take Metformin 500mg at 8:00 AM, 9:00 PM.",
  "intent": "set_reminder",
  "data": {
    "id": "e5f6g7h8",
    "medicine": "Metformin",
    "dosage": "500mg",
    "times": ["8:00 AM", "9:00 PM"],
    "active": true
  }
}
```

`set_reminder` — missing medicine name:

```json
{
  "reply": "Sure! What medicine should I remind you about, and at what times?",
  "intent": "set_reminder",
  "data": null
}
```

`health_question`:

```json
{
  "reply": "High blood pressure can cause headaches, dizziness, and shortness of breath. Please consult a doctor for personalized medical advice.",
  "intent": "health_question",
  "data": null
}
```

---

## 3. Appointments

### Appointment object shape

All appointment responses (GET list, POST create, chat `data` field) return the same shape:

```json
{
  "id": "a1b2c3d4",
  "doctor": "Dr. Sarah Johnson",
  "specialty": "Cardiologist",
  "date": "2024-04-15",
  "time": "10:30 AM",
  "status": "confirmed",
  "contact": "+1-212-555-0101",
  "email": "sarah.johnson@medicalhealth.com",
  "location": "42 Oak St, Medical Center, New York, NY 10001"
}
```

| Field       | Type           | Notes                                                                                                                        |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`        | string         | 8-character UUID fragment e.g. `"a1b2c3d4"`                                                                                  |
| `doctor`    | string         | Full name e.g. `"Dr. Sarah Johnson"` — matched from doctor database                                                          |
| `specialty` | string         | e.g. `"Cardiologist"`, `"General Physician"`                                                                                 |
| `date`      | string         | `"YYYY-MM-DD"`                                                                                                               |
| `time`      | string         | `"HH:MM AM/PM"` e.g. `"10:30 AM"`                                                                                            |
| `status`    | string         | Always `"confirmed"`                                                                                                         |
| `contact`   | string or null | Doctor's phone e.g. `"+1-212-555-0101"`. Populated when booked via chat (vector search). `null` when booked via direct POST. |
| `email`     | string or null | Doctor's email. Populated when booked via chat. `null` when booked via direct POST.                                          |
| `location`  | string or null | Clinic address. Populated when booked via chat. `null` when booked via direct POST.                                          |

---

### List all appointments

**GET** `/api/appointments`

No request body.

| Status | When   |
| ------ | ------ |
| 200    | Always |

Response `200`:

```json
[
  {
    "id": "a1b2c3d4",
    "doctor": "Dr. Sarah Johnson",
    "specialty": "Cardiologist",
    "date": "2024-04-15",
    "time": "10:30 AM",
    "status": "confirmed",
    "contact": "+1-212-555-0101",
    "email": "sarah.johnson@medicalhealth.com",
    "location": "42 Oak St, Medical Center, New York, NY 10001"
  },
  {
    "id": "z9y8x7w6",
    "doctor": "Dr. Priya Patel",
    "specialty": "General Physician",
    "date": "2024-04-20",
    "time": "2:00 PM",
    "status": "confirmed",
    "contact": "+1-312-445-7821",
    "email": "priya.patel@clinichealth.com",
    "location": "88 Maple St, Health Clinic, Chicago, IL 60601"
  }
]
```

Returns `[]` if no appointments exist.

---

### Book an appointment (direct)

**POST** `/api/appointments`

> Use this to book manually without chat. Does **not** use vector search — `contact`, `email`, `location` will be `null` in the response.

Request body:

```json
{
  "doctor": "Dr. Sarah Johnson",
  "specialty": "Cardiologist",
  "date": "2024-04-15",
  "time": "10:30 AM"
}
```

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `doctor`    | string | yes      |
| `specialty` | string | yes      |
| `date`      | string | yes      |
| `time`      | string | yes      |

| Status | When                        |
| ------ | --------------------------- |
| 200    | Appointment created         |
| 422    | Missing or wrong-type field |

Response `200`:

```json
{
  "id": "a1b2c3d4",
  "doctor": "Dr. Sarah Johnson",
  "specialty": "Cardiologist",
  "date": "2024-04-15",
  "time": "10:30 AM",
  "status": "confirmed",
  "contact": null,
  "email": null,
  "location": null
}
```

---

### Cancel an appointment

**DELETE** `/api/appointments/{id}`

No request body. `{id}` is the 8-character appointment ID.

| Status | When                            |
| ------ | ------------------------------- |
| 200    | Appointment deleted (permanent) |
| 404    | ID not found                    |

Response `200`:

```json
{ "success": true }
```

Response `404`:

```json
{ "detail": "Appointment not found" }
```

---

## 4. Reminders

### List all reminders

**GET** `/api/reminders`

No request body.

| Status | When   |
| ------ | ------ |
| 200    | Always |

Response `200`:

```json
[
  {
    "id": "e5f6g7h8",
    "medicine": "Metformin",
    "dosage": "500mg",
    "times": ["8:00 AM", "9:00 PM"],
    "active": true
  }
]
```

Returns `[]` if no reminders exist. Only returns records where `active: true`.

| Field      | Type     | Notes                                               |
| ---------- | -------- | --------------------------------------------------- |
| `id`       | string   | 8-character UUID fragment                           |
| `medicine` | string   | Medicine name                                       |
| `dosage`   | string   | e.g. `"500mg"`, `"1 tablet"`                        |
| `times`    | string[] | Array of time strings e.g. `["8:00 AM", "9:00 PM"]` |
| `active`   | boolean  | Always `true` (only active records returned)        |

---

### Add a reminder

**POST** `/api/reminders`

Request body:

```json
{
  "medicine": "Metformin",
  "dosage": "500mg",
  "times": ["8:00 AM", "9:00 PM"]
}
```

| Field      | Type     | Required              |
| ---------- | -------- | --------------------- |
| `medicine` | string   | yes                   |
| `dosage`   | string   | yes                   |
| `times`    | string[] | yes — non-empty array |

| Status | When                        |
| ------ | --------------------------- |
| 200    | Reminder created            |
| 422    | Missing or wrong-type field |

Response `200`:

```json
{
  "id": "e5f6g7h8",
  "medicine": "Metformin",
  "dosage": "500mg",
  "times": ["8:00 AM", "9:00 PM"],
  "active": true
}
```

---

### Delete a reminder

**DELETE** `/api/reminders/{id}`

No request body.

| Status | When                         |
| ------ | ---------------------------- |
| 200    | Reminder deleted (permanent) |
| 404    | ID not found                 |

Response `200`:

```json
{ "success": true }
```

Response `404`:

```json
{ "detail": "Reminder not found" }
```

---

## 5. Report Analysis

**POST** `/api/report/analyze`

Content-Type: `multipart/form-data`

| Field  | Type | Required | Notes    |
| ------ | ---- | -------- | -------- |
| `file` | File | yes      | Max 5 MB |

Accepted file types:

| Extension | MIME type                                                                 |
| --------- | ------------------------------------------------------------------------- |
| `.txt`    | `text/plain`                                                              |
| `.pdf`    | `application/pdf`                                                         |
| `.docx`   | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.doc`    | `application/msword`                                                      |

| Status | When                                 |
| ------ | ------------------------------------ |
| 200    | Analysis successful                  |
| 413    | File exceeds 5 MB                    |
| 415    | Unsupported file type                |
| 422    | No text could be extracted from file |
| 500    | AI response parse error              |

Response `200`:

```json
{
  "description": "Your CBC report shows an elevated WBC count of 12.5 K/uL (normal: 4.5–11.0), suggesting possible infection or inflammation. Hemoglobin is mildly low at 11.2 g/dL indicating mild anemia. All other values are within normal range.",
  "follow_ups": [
    "Consult your doctor within 1 week to discuss the elevated WBC count",
    "Repeat CBC in 2 weeks to monitor progress",
    "Consider urine culture or chest X-ray to rule out underlying infection"
  ],
  "diet": [
    "Increase iron-rich foods: spinach, lentils, red meat, fortified cereals",
    "Take Vitamin C with meals to improve iron absorption",
    "Stay well hydrated — at least 8 glasses of water daily",
    "Avoid tea and coffee immediately after meals"
  ],
  "precautions": [
    "Avoid strenuous physical activity until WBC normalizes",
    "Watch for signs of infection: fever, chills, unusual fatigue",
    "Do not self-medicate with antibiotics",
    "Ensure 7–8 hours of sleep nightly"
  ]
}
```

| Field         | Type     | Notes                                |
| ------------- | -------- | ------------------------------------ |
| `description` | string   | 2–4 sentence plain-language summary  |
| `follow_ups`  | string[] | 2–5 actionable follow-up steps       |
| `diet`        | string[] | 2–5 dietary recommendations          |
| `precautions` | string[] | 2–5 precautions or lifestyle changes |

Response `415`:

```json
{ "detail": "Unsupported file type 'image/png'. Allowed: .txt, .pdf, .docx" }
```

Response `413`:

```json
{ "detail": "File too large. Max size is 5 MB." }
```

Response `422`:

```json
{ "detail": "Could not extract any text from the file." }
```

---

## 6. Health Tips

**GET** `/api/health-tips`

No request body. Optional `category` query param accepted but currently ignored.

| Status | When   |
| ------ | ------ |
| 200    | Always |

Response `200`:

```json
[
  "Drink at least 8 glasses of water daily to stay hydrated.",
  "Aim for 7-9 hours of sleep each night for optimal health.",
  "Take a 10-minute walk after meals to aid digestion.",
  "Limit screen time 1 hour before bed to improve sleep quality.",
  "Stretch for 5 minutes every hour if you sit at a desk."
]
```

Returns exactly **5 randomly selected strings** from a fixed pool of 12 tips.
