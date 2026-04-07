"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CHARACTER_ROLE_LABELS, ARC_TYPE_LABELS } from "@/lib/types";
import type { Character } from "@/lib/types";
import { User } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="flex gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarFallback className="bg-muted">
            <User className="size-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{character.name}</h3>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {CHARACTER_ROLE_LABELS[character.role]}
            </Badge>
          </div>

          {character.personality_traits.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {character.personality_traits.slice(0, 4).map((trait: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {trait}
                </Badge>
              ))}
              {character.personality_traits.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{character.personality_traits.length - 4}
                </Badge>
              )}
            </div>
          )}

          {character.background && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {character.background}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">弧线:</span>
            <Badge variant="ghost" className="text-[10px]">
              {ARC_TYPE_LABELS[character.arc_type]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
