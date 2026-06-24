# Chitkara Full Stack Engineering Challenge Solution

This project provides:
- `POST /bfhl` REST API with hierarchy processing rules
- A single-page frontend to submit node entries and view structured response

## Tech Stack
- Node.js
- Express
- Vanilla HTML/CSS/JS frontend

## Setup
```bash
npm install
```

## Run
```bash
npm start
```

Server runs at `http://localhost:3000` by default.

## API
### Endpoint
`POST /bfhl`

### Request Body
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

### Identity Fields Configuration
Set environment variables to your real credentials before deployment:
- `USER_ID` (format: `fullname_ddmmyyyy`)
- `EMAIL_ID` (college email)
- `COLLEGE_ROLL_NUMBER`

Example:
```bash
USER_ID=yourname_ddmmyyyy EMAIL_ID=you@college.edu COLLEGE_ROLL_NUMBER=21CS1001 npm start
```

## Frontend
Open `http://localhost:3000` and:
- Enter JSON array input or one edge per line
- Click **Submit**
- View formatted API response
