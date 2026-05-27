 📅 Buscar disponibilidad

   curl "https://TU_APP/api/v1/availability?service_id=SERVICE_ID&date=2026-05-27" \
     -H "Authorization: Bearer TU_TOKEN"

  Respuesta:

   { "slots": ["09:00", "09:30", "10:00", "11:00", ...] }

  -------------------------------------------------------------------------------------------------------------------------------------------------

  ➕ Crear evento

   curl -X POST "https://TU_APP/api/v1/events" \
     -H "Authorization: Bearer TU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Consulta con Juan",
       "startTime": "2026-05-27T10:00:00",
       "endTime":   "2026-05-27T11:00:00",
       "serviceId": "SERVICE_ID",
       "attendeeName":  "Juan Pérez",
       "attendeeEmail": "juan@email.com",
       "attendeePhone": "+1 234 567 8900",
       "notes": "Primera consulta",
       "status": "SCHEDULED"
     }'

  -------------------------------------------------------------------------------------------------------------------------------------------------

  ✏️ Reagendar evento (modificar fecha/hora)

   curl -X PUT "https://TU_APP/api/v1/events/EVENT_ID" \
     -H "Authorization: Bearer TU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Consulta con Juan",
       "startTime": "2026-05-28T15:00:00",
       "endTime":   "2026-05-28T16:00:00",
       "status": "SCHEDULED"
     }'

  -------------------------------------------------------------------------------------------------------------------------------------------------

  ❌ Cancelar evento

   curl -X PATCH "https://TU_APP/api/v1/events/EVENT_ID/cancel" \
     -H "Authorization: Bearer TU_TOKEN"

  -------------------------------------------------------------------------------------------------------------------------------------------------

  🗑️ Eliminar evento

   curl -X DELETE "https://TU_APP/api/v1/events/EVENT_ID" \
     -H "Authorization: Bearer TU_TOKEN"

  -------------------------------------------------------------------------------------------------------------------------------------------------

  🔍 Listar eventos

   # Eventos de hoy hasta fin de semana
   curl "https://TU_APP/api/v1/events?from=2026-05-26&to=2026-05-31" \
     -H "Authorization: Bearer TU_TOKEN"

   # Filtrar por servicio
   curl "https://TU_APP/api/v1/events?from=2026-05-26&service_id=SERVICE_ID" \
     -H "Authorization: Bearer TU_TOKEN"

   # Solo cancelados
   curl "https://TU_APP/api/v1/events?status=CANCELLED" \
     -H "Authorization: Bearer TU_TOKEN"

  -------------------------------------------------------------------------------------------------------------------------------------------------

  📋 Ver servicios disponibles

   curl "https://TU_APP/api/v1/services" \
     -H "Authorization: Bearer TU_TOKEN"
