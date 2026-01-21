#!/bin/bash

echo "🚀 Iniciando migración a Supabase..."

# Verificar si las variables de entorno están configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Las variables de entorno de Supabase no están configuradas"
    echo "Por favor, edita tu archivo .env con las credenciales de Supabase"
    echo "Revisa el archivo SUPABASE_SETUP.md para más instrucciones"
    exit 1
fi

echo "✅ Variables de entorno configuradas"

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
bun install

# Verificar que las tablas existan en Supabase
echo "🔍 Verificando conexión con Supabase..."
node -e "
const { supabase } = require('./src/lib/supabase.ts');
supabase.from('products').select('count').then(({ data, error }) => {
  if (error) {
    console.log('❌ Error conectando a Supabase:', error.message);
    console.log('Por favor, ejecuta el schema SQL en tu proyecto de Supabase');
    process.exit(1);
  } else {
    console.log('✅ Conexión a Supabase exitosa');
    process.exit(0);
  }
}).catch(err => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migración a Supabase completada!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "1. Ejecuta el schema SQL en tu proyecto de Supabase"
    echo "2. Reinicia el servidor: bun run dev"
    echo "3. Verifica que la aplicación funcione correctamente"
    echo ""
    echo "🌐 Para desplegar en producción:"
    echo "- Vercel: https://vercel.com"
    echo "- Netlify: https://netlify.com"
    echo ""
else
    echo "❌ La migración falló. Por favor, revisa los errores arriba."
    exit 1
fi