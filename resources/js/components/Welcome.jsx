import React from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos el logo. ¡Asegúrate de que la ruta sea correcta!
//import logoGespis from '../images/logo2.jpg';

export default function Welcome() {
  // Usamos el hook de React Router para la navegación
  const navigate = useNavigate();

  const handleEntrar = () => {
    // Esto te llevará a la ruta de login
    navigate('/dashboard');
  };

  return (
    // Contenedor principal: ocupa toda la pantalla, centra el contenido y tiene un fondo claro
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      {/* Contenedor central con animación suave de aparición (opcional pero queda bien) */}
      <div className="flex flex-col items-center text-center max-w-2xl animate-fade-in-up">
        
        {/* LOGO */}
        <div className="mb-8">
          <img 
            src="/images/logo2.png" 
            alt="Logo GesPis" 
            className="w-64 md:w-80 rounded-3xl shadow-2xl border-4 border-white object-cover"
          />
        </div>

        {/* TÍTULO */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-10 tracking-tight">
          Gestión de la Piscina<br className="hidden md:block" />
          <span className="text-cyan-700">Francisco Ayala</span>
        </h1>

        {/* BOTÓN DE ENTRADA */}
        <button 
          onClick={handleEntrar}
          // Colores basados en tu dashboard: fondo turquesa, hover más oscuro, sombra y efecto de elevación
          className="group relative px-10 py-4 bg-[#0883A3] hover:bg-[#06657E] text-white text-xl font-bold rounded-full shadow-lg shadow-cyan-900/20 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
        >
          <span className="flex items-center gap-2">
            Entrar
            {/* Pequeño icono de flecha usando SVG directamente para no depender de librerías extra */}
            <svg 
              className="w-6 h-6 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

      </div>
    </div>
  );
}