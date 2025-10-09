import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Router AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Iniciar Sesión
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Router Inteligente de
            <span className="text-blue-600"> Modelos de IA</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Optimiza automáticamente tus costos de IA eligiendo el mejor modelo 
            según el tipo de tarea, velocidad requerida y presupuesto.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium">
                  Comenzar Gratis
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                Ir al Dashboard
              </Link>
            </SignedIn>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selección Inteligente
            </h3>
            <p className="text-gray-600">
              Algoritmo que elige automáticamente el modelo óptimo para cada tarea
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-green-600 text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ahorro de Costos
            </h3>
            <p className="text-gray-600">
              Reduce hasta 70% en costos usando el modelo más eficiente para cada caso
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-purple-600 text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Velocidad Optimizada
            </h3>
            <p className="text-gray-600">
              Balance perfecto entre velocidad, calidad y costo para cada consulta
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
