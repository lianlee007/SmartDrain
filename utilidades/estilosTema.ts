export const urlCapaMapa = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
};

export const estiloTooltipGrafica = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '11px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
  };
};

export const cursorGrafica = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
  };
};
