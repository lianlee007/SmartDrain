import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  Activity,
  MapPin,
  Sparkles,
  ShieldCheck,
  Camera,
  Navigation,
  Users,
  LayoutGrid,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { usarAuth } from '../contextos/ContextoAuth';

const pasos = [
  {
    num: '01',
    titulo: 'Describe el problema',
    texto: 'Elige el tipo de incidente (obstrucción, mal olor, tapa dañada o desbordamiento) y cuéntanos qué ves.',
    icono: AlertTriangle,
  },
  {
    num: '02',
    titulo: 'Ubica y documenta',
    texto: 'Marca el punto en el mapa con GPS o manualmente y sube una foto como evidencia.',
    icono: Camera,
  },
  {
    num: '03',
    titulo: 'Envía tu reporte',
    texto: 'Tu alerta llega al panel operativo y queda visible en la galería de reportes ciudadanos.',
    icono: CheckCircle2,
  },
];

const tiposReporte = [
  { titulo: 'Obstrucción', desc: 'Basura o sedimentos', color: 'border-orange-500/40 bg-orange-500/10 text-orange-400' },
  { titulo: 'Mal olor', desc: 'Gases o estancamiento', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  { titulo: 'Tapa dañada', desc: 'Riesgo en la vía', color: 'border-red-500/40 bg-red-500/10 text-red-400' },
  { titulo: 'Desbordamiento', desc: 'Exceso de agua', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
];

export default function Inicio() {
  const { usuario } = usarAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div className="absolute top-[-15%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/6 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Popayán · Ciudadanía + IoT
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white leading-[1.08] mb-6">
                ¿Viste un problema en el{' '}
                <span className="italic text-emerald-400">alcantarillado</span>? Repórtalo aquí.
              </h1>

              <p className="text-lg text-slate-400 mb-4 max-w-xl leading-relaxed">
                SmartDrain conecta tu reporte con el monitoreo en tiempo real de la red de drenaje.
                En pocos minutos puedes avisar a las autoridades con foto y ubicación exacta.
              </p>

              {usuario && (
                <p className="text-sm text-emerald-400/90 mb-8 font-medium">
                  Hola, {usuario.nombre}. Tu participación ayuda a prevenir inundaciones.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  to="/reportar"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-5 font-bold text-slate-950 bg-emerald-500 rounded-2xl hover:bg-emerald-400 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <AlertTriangle className="h-5 w-5" />
                  Crear reporte ahora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/reportes-ciudadanos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-5 font-bold text-white rounded-2xl border border-slate-600 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-500 transition-all"
                >
                  <Users className="h-5 w-5 text-emerald-400" />
                  Ver reportes ciudadanos
                </Link>
              </div>

              <Link
                to="/panel"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest"
              >
                <LayoutGrid className="h-4 w-4" />
                Ir al panel operativo IoT
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <div className="mt-10 flex flex-wrap gap-6 text-slate-500">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Datos seguros
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Navigation className="h-4 w-4 text-emerald-500" />
                  GPS integrado
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  8 sensores activos
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 to-blue-500/10 rounded-[2.5rem] blur-3xl -z-10" />
              <div className="card-premium rounded-[2.5rem] p-6 lg:p-8 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-slate-950" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        Vista previa
                      </p>
                      <p className="text-sm font-bold text-white">Centro de monitoreo</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <p className="text-[9px] font-bold uppercase text-emerald-400 mb-2">Nivel red</p>
                    <p className="text-3xl font-heading text-white">78%</p>
                    <p className="text-[10px] text-slate-500 mt-1">Capacidad operativa</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4">
                    <p className="text-[9px] font-bold uppercase text-slate-500 mb-2">Reportes hoy</p>
                    <p className="text-3xl font-heading text-white">+1</p>
                    <p className="text-[10px] text-slate-500 mt-1">Ciudadanía activa</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Popayán, Cauca</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Telemetría + reportes georreferenciados en un solo lugar
                    </p>
                  </div>
                </div>

                <Link
                  to="/reportar"
                  className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-800 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500/40 text-sm font-bold text-white transition-all"
                >
                  <Camera className="h-4 w-4 text-emerald-400" />
                  Reportar con foto y ubicación
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500 mb-3">
              Así de simple
            </p>
            <h2 className="text-3xl lg:text-4xl font-heading font-medium text-white italic mb-4">
              Tres pasos para reportar un incidente
            </h2>
            <p className="text-slate-400">
              No necesitas ser experto. Solo describe lo que ves, marca dónde está y envía.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pasos.map((paso, i) => (
              <motion.div
                key={paso.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-premium rounded-3xl p-8 border border-slate-800 hover:border-emerald-500/30 transition-colors group"
              >
                <span className="text-4xl font-heading text-emerald-500/30 font-bold">{paso.num}</span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center my-5 group-hover:bg-emerald-500/20 transition-colors">
                  <paso.icono className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{paso.titulo}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{paso.texto}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/reportar"
              className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              Empezar mi reporte
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tipos de reporte */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-heading font-medium text-white italic mb-3">
                ¿Qué puedes reportar?
              </h2>
              <p className="text-slate-400 max-w-lg">
                Selecciona la categoría que mejor describa el hallazgo. Cada reporte ayuda a priorizar
                el mantenimiento en tu barrio.
              </p>
            </div>
            <Link
              to="/reportar"
              className="shrink-0 inline-flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest hover:underline"
            >
              Ir al formulario
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiposReporte.map((tipo) => (
              <Link
                key={tipo.titulo}
                to="/reportar"
                className={`rounded-2xl border p-6 hover:scale-[1.02] transition-transform ${tipo.color}`}
              >
                <h3 className="font-bold text-white text-sm mb-1">{tipo.titulo}</h3>
                <p className="text-xs opacity-80">{tipo.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-heading text-emerald-400 mb-1">8</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sensores IoT</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-emerald-400 mb-1">24/7</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monitoreo</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-emerald-400 mb-1">GPS</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ubicación exacta</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-emerald-400 mb-1">IA</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Análisis inteligente</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center card-premium rounded-[2.5rem] p-12 lg:p-16 border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <AlertTriangle className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-heading font-medium text-white italic mb-4">
            Tu reporte puede evitar una inundación
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Toma una foto, usa tu ubicación actual y envía el incidente. El equipo operativo lo verá
            en el panel y en la galería pública de reportes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reportar"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
            >
              Reportar problema ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/reportes-ciudadanos"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 border border-slate-600 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              <Users className="h-5 w-5" />
              Ver galería de reportes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
