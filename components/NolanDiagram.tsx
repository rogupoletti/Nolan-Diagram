import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface NolanDiagramProps {
  economic: number;
  personal: number;
}

const NolanDiagram: React.FC<NolanDiagramProps> = ({ economic, personal }) => {
  const { t } = useTranslation();
  const size = 300;
  const center = size / 2;
  const padding = 25;
  
  // Convert scores (-100 to 100) to coordinates (padding to size-padding)
  const plotSize = size - padding * 2;
  const plotCenter = plotSize / 2;
  const x = padding + plotCenter + (economic / 100) * plotCenter;
  const y = padding + plotCenter - (personal / 100) * plotCenter;

  const QuadrantLabel: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
    <text x={x} y={y} fill="#6b7280" fontSize="12" textAnchor="middle" className="font-semibold">
      {children}
    </text>
  );

  const AxisLabel: React.FC<{x: number; y: number; children: React.ReactNode; rotation?: number}> = ({x, y, children, rotation = 0}) => (
     <text x={x} y={y} fill="#9ca3af" fontSize="10" textAnchor="middle" transform={`rotate(${rotation}, ${x}, ${y})`}>
      {children}
    </text>
  );

  return (
    <div className="relative w-full" style={{paddingBottom: '100%'}}>
    <svg viewBox={`0 0 ${size} ${size}`} className="absolute top-0 left-0 w-full h-full">
      {/* Background with border */}
      <rect x="0" y="0" width={size} height={size} fill="white" />
      <rect x={padding} y={padding} width={plotSize} height={plotSize} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      
      {/* Axis lines */}
      <line x1={padding} y1={center} x2={size - padding} y2={center} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={center} y1={padding} x2={center} y2={size - padding} stroke="#e5e7eb" strokeWidth="1" />
      
      {/* Quadrant Labels */}
      <QuadrantLabel x={center + plotCenter/2} y={center - plotCenter/2 - 5}>{t('diagram.quadrants.libertarian')}</QuadrantLabel>
      <QuadrantLabel x={center - plotCenter/2} y={center - plotCenter/2 - 5}>{t('diagram.quadrants.left_liberal')}</QuadrantLabel>
      <QuadrantLabel x={center + plotCenter/2} y={center + plotCenter/2 + 15}>{t('diagram.quadrants.conservative')}</QuadrantLabel>
      <QuadrantLabel x={center - plotCenter/2} y={center + plotCenter/2 + 15}>{t('diagram.quadrants.authoritarian')}</QuadrantLabel>

      {/* Axis Labels */}
      <AxisLabel x={center + plotCenter/2} y={size - 10}>{t('diagram.axes.more_economic')}</AxisLabel>
      <AxisLabel x={center - plotCenter/2} y={size - 10}>{t('diagram.axes.less_economic')}</AxisLabel>
      <AxisLabel x={12} y={center - plotCenter/2} rotation={-90}>{t('diagram.axes.more_personal')}</AxisLabel>
      <AxisLabel x={12} y={center + plotCenter/2} rotation={-90}>{t('diagram.axes.less_personal')}</AxisLabel>

      {/* Result Point */}
      <circle cx={x} cy={y} r="6" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
    </svg>
    </div>
  );
};

export default NolanDiagram;