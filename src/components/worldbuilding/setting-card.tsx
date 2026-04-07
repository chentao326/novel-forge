"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WORLD_CATEGORY_LABELS } from "@/lib/types";
import type { WorldSetting } from "@/lib/types";
import { Globe, ListTree, Shield } from "lucide-react";

interface SettingCardProps {
  setting: WorldSetting;
  childCount?: number;
  onClick?: () => void;
}

export function SettingCard({ setting, childCount = 0, onClick }: SettingCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium">{setting.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {WORLD_CATEGORY_LABELS[setting.category]}
          </Badge>
        </div>

        {/* Content preview */}
        {setting.content && (
          <p className="mb-2 line-clamp-3 text-xs text-muted-foreground">
            {setting.content.slice(0, 100)}
            {setting.content.length > 100 ? "..." : ""}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {setting.rules.length > 0 && (
            <span className="flex items-center gap-1">
              <Shield className="size-3" />
              {setting.rules.length} 条规则
            </span>
          )}
          {childCount > 0 && (
            <span className="flex items-center gap-1">
              <ListTree className="size-3" />
              {childCount} 个子设定
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
