import { createClient } from "@/lib/supabaseServer";

export default async function AdminDebugPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-pyro-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-pyro-black">Diagnóstico Admin</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p><strong>❌ No hay usuario autenticado</strong></p>
            <p>Por favor, <a href="/login" className="underline">inicia sesión</a> primero.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users_extension")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-pyro-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-pyro-black">Diagnóstico de Acceso Admin</h1>
        
        {/* Información del Usuario */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-pyro-black">Información del Usuario</h2>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>

        {/* Información del Perfil */}
        <div className={`border rounded-lg p-6 ${profile ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="text-xl font-semibold mb-4 text-pyro-black">Perfil en users_extension</h2>
          {profileError ? (
            <div className="space-y-2">
              <p className="text-red-700"><strong>❌ Error al leer perfil:</strong></p>
              <pre className="bg-red-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(profileError, null, 2)}</pre>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Posibles causas:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>El usuario no tiene perfil en la tabla users_extension</li>
                <li>Las políticas RLS están bloqueando el acceso</li>
                <li>La tabla users_extension no existe o tiene un esquema diferente</li>
              </ul>
            </div>
          ) : profile ? (
            <div className="space-y-2">
              <p className="text-green-700"><strong>✅ Perfil encontrado:</strong></p>
              <div className="bg-white border border-gray-200 rounded p-4 mt-2">
                <pre className="text-xs overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
              </div>
              <div className="mt-4">
                <p className="text-sm"><strong>Rol actual:</strong> <span className={`px-3 py-1 rounded ${profile.role === 'admin' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{profile.role || 'No definido'}</span></p>
                {profile.role !== 'admin' && (
                  <div className="mt-3 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p className="font-semibold">⚠️ Tu usuario no tiene rol de administrador</p>
                    <p className="text-sm mt-1">Ejecuta este SQL en Supabase para hacerte admin:</p>
                    <pre className="bg-yellow-200 p-2 rounded text-xs mt-2 overflow-auto">
{`UPDATE public.users_extension
SET role = 'admin'
WHERE id = '${user.id}';`}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <p><strong>❌ No se encontró perfil</strong></p>
              <p className="text-sm mt-2">El usuario no tiene registro en users_extension. Ejecuta este SQL:</p>
              <pre className="bg-red-100 p-3 rounded text-xs mt-2 overflow-auto">
{`INSERT INTO public.users_extension (id, role, first_name, last_name)
VALUES ('${user.id}', 'admin', 'Admin', 'User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';`}
              </pre>
            </div>
          )}
        </div>

        {/* Verificación de Políticas RLS */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-pyro-black">Verificación de Acceso</h2>
          {profile?.role === 'admin' ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">✅ ¡Todo correcto! Puedes acceder al panel admin.</p>
              <a href="/admin" className="inline-block mt-3 bg-pyro-gold text-pyro-black px-4 py-2 rounded hover:bg-opacity-90">
                Ir al Panel Admin
              </a>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="font-semibold">⚠️ No puedes acceder al panel admin aún</p>
              <p className="text-sm mt-1">Sigue las instrucciones arriba para configurar tu usuario como admin.</p>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-pyro-black">Información Adicional</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Consulta para verificar todos los usuarios:</strong></p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`SELECT 
  u.id,
  u.email,
  ue.role,
  ue.first_name,
  ue.last_name
FROM auth.users u
LEFT JOIN public.users_extension ue ON u.id = ue.id
ORDER BY u.created_at;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

