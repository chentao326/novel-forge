"use client";

import React, { useMemo } from "react";
import type { Character, ArcType } from "@/lib/types";
import { ARC_TYPE_LABELS } from "@/lib/types";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArcVisualizationProps {
  character: Character;
}

// Arc curve generators
function generateArcPoints(
  arcType: ArcType,
  width: number,
  height: number,
  padding: number
): string {
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points: { x: number; y: number }[] = [];

  switch (arcType) {
    case "positive": {
      // Rising curve: starts low, dips slightly, then rises
      for (let i = 0; i <= 100; i += 2) {
        const t = i / 100;
        const x = padding + t * chartW;
        // S-curve: dip then rise
        const y =
          padding +
          chartH * 0.8 -
          chartH * 0.7 * (1 / (1 + Math.exp(-8 * (t - 0.5))));
        points.push({ x, y });
      }
      break;
    }
    case "negative": {
      // Falling curve: starts high, peaks, then falls
      for (let i = 0; i <= 100; i += 2) {
        const t = i / 100;
        const x = padding + t * chartW;
        const y =
          padding +
          chartH * 0.2 +
          chartH * 0.7 * (1 / (1 + Math.exp(-8 * (t - 0.5))));
        points.push({ x, y });
      }
      break;
    }
    case "flat":
    default: {
      // Flat with minor fluctuations
      for (let i = 0; i <= 100; i += 2) {
        const t = i / 100;
        const x = padding + t * chartW;
        const fluctuation = Math.sin(t * Math.PI * 4) * chartH * 0.05;
        const y = padding + chartH * 0.5 + fluctuation;
        points.push({ x, y });
      }
      break;
    }
  }

  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

// Get arc color
function getArcColor(arcType: ArcType): string {
  switch (arcType) {
    case "positive":
      return "#3b82f6";
    case "negative":
      return "#ef4444";
    case "flat":
      return "#9ca3af";
  }
}

// Get arc gradient
function getArcGradientId(arcType: ArcType): string {
  return `arc-gradient-${arcType}`;
}

export function ArcVisualization({ character }: ArcVisualizationProps) {
  const svgWidth = 600;
  const svgHeight = 250;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const arcColor = getArcColor(character.arc_type);
  const pathD = generateArcPoints(character.arc_type, svgWidth, svgHeight, padding.left);

  // Calculate turning point positions on the curve
  const turningPointPositions = useMemo(() => {
    if (character.turning_points.length === 0) return [];
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    return character.turning_points.map((_, index) => {
      const t = (index + 1) / (character.turning_points.length + 1);
      const x = padding.left + t * chartW;

      // Calculate y based on arc type
      let y: number;
      switch (character.arc_type) {
        case "positive":
          y =
            padding.top +
            chartH * 0.8 -
            chartH * 0.7 * (1 / (1 + Math.exp(-8 * (t - 0.5))));
          break;
        case "negative":
          y =
            padding.top +
            chartH * 0.2 +
            chartH * 0.7 * (1 / (1 + Math.exp(-8 * (t - 0.5))));
          break;
        case "flat":
        default:
          y = padding.top + chartH * 0.5;
          break;
      }

      return { x, y, label: character.turning_points[index] };
    });
  }, [character.turning_points, character.arc_type]);

  const arcIcon =
    character.arc_type === "positive" ? (
      <TrendingUp className="size-4" style={{ color: arcColor }} />
    ) : character.arc_type === "negative" ? (
      <TrendingDown className="size-4" style={{ color: arcColor }} />
    ) : (
      <Minus className="size-4" style={{ color: arcColor }} />
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {arcIcon}
          <span className="text-sm font-medium">{character.name} 的成长弧线</span>
          <Badge variant="outline" style={{ borderColor: arcColor, color: arcColor }}>
            {ARC_TYPE_LABELS[character.arc_type]}
          </Badge>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minHeight: 200 }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={getArcGradientId(character.arc_type)} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={arcColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={arcColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + pct * (svgHeight - padding.top - padding.bottom);
            return (
              <line
                key={pct}
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Y-axis labels */}
          <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
            真相
          </text>
          <text x={padding.left - 8} y={svgHeight - padding.bottom + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
            谎言
          </text>

          {/* X-axis labels */}
          <text x={padding.left} y={svgHeight - 8} textAnchor="start" fontSize="10" fill="#9ca3af">
            0%
          </text>
          <text x={svgWidth - padding.right} y={svgHeight - 8} textAnchor="end" fontSize="10" fill="#9ca3af">
            100%
          </text>
          <text x={(svgWidth - padding.left - padding.right) / 2 + padding.left} y={svgHeight - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
            故事进程
          </text>

          {/* Area fill under curve */}
          <path
            d={`${pathD} L ${svgWidth - padding.right} ${svgHeight - padding.bottom} L ${padding.left} ${svgHeight - padding.bottom} Z`}
            fill={`url(#${getArcGradientId(character.arc_type)})`}
          />

          {/* Arc curve */}
          <path
            d={pathD}
            fill="none"
            stroke={arcColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Turning points */}
          {turningPointPositions.map((tp, index) => (
            <g key={index}>
              {/* Vertical dashed line */}
              <line
                x1={tp.x}
                y1={tp.y}
                x2={tp.x}
                y2={svgHeight - padding.bottom}
                stroke={arcColor}
                strokeWidth={0.5}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              {/* Marker circle */}
              <circle cx={tp.x} cy={tp.y} r={5} fill="white" stroke={arcColor} strokeWidth={2} />
              {/* Label */}
              <text
                x={tp.x}
                y={tp.y - 10}
                textAnchor="middle"
                fontSize="9"
                fill={arcColor}
                fontWeight={500}
              >
                {tp.label.length > 8 ? tp.label.slice(0, 8) + ".." : tp.label}
              </text>
            </g>
          ))}

          {/* Start and end markers */}
          <circle cx={padding.left} cy={svgHeight - padding.bottom - 2} r={4} fill={arcColor} opacity={0.5} />
          <circle cx={svgWidth - padding.right} cy={padding.top + 2} r={4} fill={arcColor} />
        </svg>
      </div>

      {/* Arc description */}
      {character.arc_description && (
        <p className="text-sm text-muted-foreground">{character.arc_description}</p>
      )}

      {/* Turning points list */}
      {character.turning_points.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">关键转折点</h4>
          {character.turning_points.map((point, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: arcColor }}
              >
                {index + 1}
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
