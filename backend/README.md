# Wedding Backend (Express + MongoDB)

Backend REST para la app de boda. Persiste deseos y resultados del quiz en MongoDB Atlas.

## Requisitos
- Node.js 18+
- MongoDB Atlas

## Variables de entorno
Crear un `.env` en `backend/`:

```
PORT=3000
MONGODB_URI=YOUR_MONGODB_URI
ADMIN_TOKEN=super-token-largo
ALLOWED_ORIGINS=*
```

## Ejecutar en local
```
npm install
npm run dev
```

## Build + start
```
npm run build
npm start
```

## Endpoints

### Health
```
GET /health
```

### Wishes
```
POST /api/wishes
Content-Type: application/json

{
  "email": "invitado@mail.com",
  "country": "Argentina",
  "reason": "Queremos conocer mas del mundo y celebrar la boda."
}
```

```
GET /api/wishes?page=1&limit=20
Authorization: Bearer YOUR_ADMIN_TOKEN
```

```
DELETE /api/wishes/:id
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Quiz results (opcional)
```
POST /api/quiz-results
Content-Type: application/json

{
  "email": "invitado@mail.com",
  "score": 30,
  "percent": 75,
  "breakdown": {
    "q1": 10
  }
}

### Registrations
```
POST /api/registrations
Content-Type: application/json

{
  "email": "invitado@mail.com",
  "firstName": "Cristian",
  "lastName": "Carmen",
  "country": "Argentina"
}
```
```

```
GET /api/quiz-results?page=1&limit=20
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Notas:
- Si `ADMIN_TOKEN` esta vacio, los endpoints admin quedan abiertos.

## Deploy (Render / Railway)
Checklist rapido:
1. Crear un nuevo servicio Node.
2. Setear variables de entorno (`MONGODB_URI`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS`, `PORT`).
3. Build command: `npm run build`
4. Start command: `npm start`
5. Verificar `/health`.
