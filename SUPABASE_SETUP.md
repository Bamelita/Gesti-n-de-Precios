# Instrucciones para configurar Supabase

## 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita usando GitHub o Google
3. Crea un nuevo proyecto

## 2. Obtener credenciales
1. En tu proyecto de Supabase, ve a Settings > API
2. Copia los siguientes valores:
   - **Project URL** (ej: https://xxxxxxxx.supabase.co)
   - **anon public key** (empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Configurar variables de entorno
Actualiza tu archivo `.env` con las credenciales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Crear tablas en Supabase
1. En tu proyecto de Supabase, ve a SQL Editor
2. Pega y ejecuta el contenido del archivo `supabase-schema.sql`
3. Esto creará las tablas `products` y `settings` con toda la estructura necesaria

## 5. Verificar configuración
1. Reinicia el servidor de desarrollo: `bun run dev`
2. La aplicación ahora debería conectarse a Supabase
3. Todos los datos se guardarán en la nube

## 6. Despliegue en producción (opcional)
Para que la aplicación sea accesible desde cualquier dispositivo:

### Opción A: Vercel (Recomendado)
1. Crea cuenta en [https://vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en Vercel
4. Despliega automáticamente

### Opción B: Netlify
1. Crea cuenta en [https://netlify.com](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. Despliega

## Beneficios de Supabase:
- ✅ Base de datos en la nube gratuita
- ✅ Acceso desde cualquier dispositivo
- ✅ Actualizaciones en tiempo real
- ✅ Backup automático
- ✅ Escalabilidad infinita
- ✅ API REST incluida
- ✅ Soporte para PostgreSQL

## Notas importantes:
- Los datos locales (SQLite) no se migran automáticamente
- Deberás ingresar los productos nuevamente después del cambio
- La configuración de ajustes globales también deberá configurarse nuevamente