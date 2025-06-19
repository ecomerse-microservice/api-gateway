#!/bin/bash

echo "Generando cliente de Prisma para PostgreSQL..."
npx prisma generate

echo "Aplicando migraciones para PostgreSQL..."
npx prisma migrate dev --name init

echo "¡Migración a PostgreSQL completada para API Gateway!" 