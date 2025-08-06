# RenkoNet - Red Social Completa

Una red social moderna y completa con todas las funcionalidades de Instagram, construida con React, Supabase y tecnologías PWA.

## 🚀 Características Principales

### 📱 Funcionalidades Core
- ✅ **Autenticación completa** - Registro, login, recuperación de contraseña
- ✅ **Perfiles de usuario** - Avatares, biografías, estadísticas
- ✅ **Feed de publicaciones** - Timeline con posts de usuarios seguidos
- ✅ **Subida de contenido** - Fotos y videos con compresión automática
- ✅ **Interacciones sociales** - Likes, comentarios, seguir/dejar de seguir
- ✅ **Mensajes directos** - Chat privado en tiempo real
- ✅ **Historias** - Contenido temporal que expira en 24 horas
- ✅ **Exploración** - Descubrimiento de contenido trending

### 🎯 Funcionalidades Avanzadas
- ✅ **Temas/Grupos** - Comunidades por especialidad e intereses
- ✅ **Sistema de verificación** - Con planes de pago ($9.99/mes, $99.99/año)
- ✅ **Panel de administración** - Gestión completa de usuarios y contenido
- ✅ **Sistema de anuncios** - Monetización con anuncios rotativos
- ✅ **Roles de usuario** - Normal, Verificado, Administrador

### 📱 PWA (Progressive Web App)
- ✅ **Instalable** - Se puede instalar como app nativa
- ✅ **Funciona offline** - Cache inteligente con Service Worker
- ✅ **Notificaciones push** - Alertas en tiempo real
- ✅ **Responsive** - Optimizada para móvil y desktop
- ✅ **App shortcuts** - Accesos rápidos desde el launcher

### 🌍 Características Técnicas
- ✅ **Internacionalización** - Español e inglés
- ✅ **SEO optimizado** - Meta tags completos
- ✅ **Seguridad** - Row Level Security en Supabase
- ✅ **Optimización** - Code splitting, lazy loading, minificación

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **React Router** - Navegación entre páginas
- **Tailwind CSS** - Estilos y diseño responsive
- **Shadcn/UI** - Componentes de interfaz
- **Lucide React** - Iconos modernos
- **Vite** - Build tool y desarrollo

### Backend
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Row Level Security** - Seguridad a nivel de fila
- **Real-time subscriptions** - Actualizaciones en tiempo real

### PWA
- **Service Worker** - Cache y funcionalidad offline
- **Web App Manifest** - Configuración de instalación
- **Push Notifications** - Notificaciones nativas

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

### 1. Clonar el repositorio
\`\`\`bash
git clone <tu-repositorio>
cd social-network-pwa-new
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 3. Configurar variables de entorno
Crea un archivo \`.env\` basado en \`.env.example\`:

\`\`\`env
VITE_SUPABASE_URL=https://yrokptdcmwqvimqlhaac.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb2twdGRjbXdxdmltcWxoYWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzAyNDQsImV4cCI6MjA2OTk0NjI0NH0.daSupk2k9W6Z3qgpVkjhkaHzNOB-ieYiZdrPFRAQugY
\`\`\`

### 4. Configurar Supabase

#### Crear las tablas necesarias
Ejecuta este script SQL en tu panel de Supabase:

\`\`\`sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'normal',
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_sponsored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de seguidores
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Tabla de likes
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Tabla de comentarios
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historias
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de temas/grupos
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros de temas
CREATE TABLE topic_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Tabla de anuncios
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de verificación
CREATE TABLE verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Lectura pública de perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden actualizar su perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insertar perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Lectura pública de posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- [Continúa con más políticas...]
\`\`\`

### 5. Ejecutar en desarrollo
\`\`\`bash
npm run dev
\`\`\`

### 6. Construir para producción
\`\`\`bash
npm run build
\`\`\`

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Comando de build: \`npm run build\`
4. Directorio de publicación: \`dist\`

## 👥 Uso de la Aplicación

### Para Usuarios Normales
1. **Registro/Login** - Crea tu cuenta o inicia sesión
2. **Completa tu perfil** - Añade avatar, biografía, información
3. **Explora contenido** - Ve el feed, explora usuarios y temas
4. **Interactúa** - Da likes, comenta, sigue usuarios
5. **Crea contenido** - Sube fotos, videos, crea historias
6. **Mensajes** - Chatea con otros usuarios

### Para Administradores
1. **Panel de Admin** - Accede desde el menú lateral
2. **Gestión de usuarios** - Cambia roles, verifica usuarios
3. **Moderación** - Elimina contenido inapropiado
4. **Anuncios** - Crea y gestiona campañas publicitarias
5. **Verificaciones** - Aprueba/rechaza solicitudes de verificación

### Sistema de Verificación
1. **Solicitar verificación** - Ve a la página de verificación
2. **Selecciona plan** - Mensual ($9.99) o Anual ($99.99)
3. **Completa información** - Profesión, razón, redes sociales
4. **Pago** - Procesa el pago de forma segura
5. **Revisión** - Espera la aprobación del administrador

## 🔧 Estructura del Proyecto

\`\`\`
src/
├── components/
│   ├── auth/           # Autenticación
│   ├── admin/          # Panel de administración
│   ├── feed/           # Feed principal
│   ├── profile/        # Perfiles de usuario
│   ├── messages/       # Mensajes directos
│   ├── stories/        # Historias
│   ├── topics/         # Temas/grupos
│   ├── verification/   # Sistema de verificación
│   ├── layout/         # Navegación y layout
│   └── ui/             # Componentes de interfaz
├── contexts/           # Contextos de React
├── lib/                # Utilidades y configuración
└── App.jsx             # Componente principal
\`\`\`

## 🎨 Personalización

### Colores y Tema
Edita \`src/index.css\` para cambiar los colores principales:

\`\`\`css
:root {
  --primary: 220 98% 61%;      /* Azul principal */
  --secondary: 220 14.3% 95.9%; /* Gris claro */
  --accent: 220 14.3% 95.9%;    /* Color de acento */
}
\`\`\`

### Logo y Branding
- Reemplaza los iconos en \`public/\`
- Actualiza el manifest en \`public/manifest.json\`
- Cambia el nombre en \`index.html\`

## 📱 Características PWA

### Instalación
- La app muestra automáticamente un prompt de instalación
- Se puede instalar desde el navegador (Chrome: menú > Instalar app)
- Funciona como app nativa una vez instalada

### Offline
- Cache inteligente de recursos estáticos
- Funcionalidad básica disponible sin conexión
- Sincronización automática al restaurar conexión

### Notificaciones
- Notificaciones push para nuevos mensajes
- Alertas de interacciones (likes, comentarios)
- Configurables desde el perfil de usuario

## 🔒 Seguridad

### Row Level Security (RLS)
- Todas las tablas tienen RLS habilitado
- Los usuarios solo pueden acceder a sus datos
- Políticas específicas para cada tipo de contenido

### Autenticación
- JWT tokens con refresh automático
- Sesiones persistentes y seguras
- Recuperación de contraseña por email

## 🐛 Solución de Problemas

### Error de conexión a Supabase
1. Verifica las variables de entorno
2. Confirma que las URLs son correctas
3. Revisa las políticas RLS en Supabase

### Problemas de instalación PWA
1. Verifica que el manifest.json sea válido
2. Confirma que el Service Worker se registre
3. Usa HTTPS en producción

### Errores de permisos
1. Revisa las políticas RLS
2. Confirma que el usuario esté autenticado
3. Verifica los roles de usuario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver \`LICENSE\` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crea un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación de Supabase

---

**RenkoNet** - La red social del futuro, hoy. 🚀

