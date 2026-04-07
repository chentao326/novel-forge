"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { GENRE_DATA, searchTropes } from "@/lib/genres/genre-data";
import type { GenreTemplate, GenreTrope } from "@/lib/genres/genre-data";
import type { Genre } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const POPULARITY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  common: { label: "常见", icon: Star, color: "text-muted-foreground" },
  popular: { label: "流行", icon: TrendingUp, color: "text-blue-500" },
  niche: { label: "小众", icon: Sparkles, color: "text-purple-500" },
};

const GENRE_ICONS: Record<string, React.ElementType> = {
  fantasy: Zap,
  romance: Sparkles,
  scifi: BookOpen,
  mystery: Search,
  urban: TrendingUp,
  historical: Star,
};

interface GenreBrowserProps {
  projectId?: string;
  onApplyGenre?: (genre: Genre) => void;
}

export function GenreBrowser({ onApplyGenre }: GenreBrowserProps) {
  const currentProject = useProjectStore((s) => s.getCurrentProject());
  const updateProject = useProjectStore((s) => s.updateProject);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [appliedGenre, setAppliedGenre] = useState<string | null>(
    currentProject?.genre ?? null
  );

  const filteredTropes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTropes(searchQuery.trim());
  }, [searchQuery]);

  const handleApplyGenre = (genreId: Genre) => {
    if (!currentProject) return;
    updateProject(currentProject.id, { genre: genreId });
    setAppliedGenre(genreId);
    onApplyGenre?.(genreId);
  };

  const toggleGenre = (genreId: string) => {
    setExpandedGenre((prev) => (prev === genreId ? null : genreId));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索套路、桥段..."
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {filteredTropes && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            搜索结果 ({filteredTropes.length})
          </h3>
          {filteredTropes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              未找到匹配的套路
            </p>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {filteredTropes.map((trope, index) => (
                  <TropeCard key={index} trope={trope} compact />
                ))}
              </div>
            </ScrollArea>
          )}
          <Separator />
        </div>
      )}

      {/* Genre Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENRE_DATA.map((genre) => {
          const Icon = GENRE_ICONS[genre.id] || BookOpen;
          const isExpanded = expandedGenre === genre.id;
          const isApplied = appliedGenre === genre.id;

          return (
            <Card
              key={genre.id}
              className={`transition-all ${isApplied ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleGenre(genre.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="size-4" />
                    {genre.name}
                    {isApplied && <Check className="size-4 text-primary" />}
                  </CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  {genre.description}
                </CardDescription>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Tropes */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      常见套路 ({genre.tropes.length})
                    </h4>
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        {genre.tropes.map((trope, i) => (
                          <TropeCard key={i} trope={trope} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator />

                  {/* Pacing Guide */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      节奏指南
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {genre.pacingGuide}
                    </p>
                  </div>

                  <Separator />

                  {/* Reader Expectations */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      读者期待
                    </h4>
                    <ul className="space-y-1">
                      {genre.readerExpectations.map((exp, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Sub-genres */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      子类型
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {genre.subGenres.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Apply Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    variant={isApplied ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyGenre(genre.id);
                    }}
                    disabled={!currentProject}
                  >
                    {isApplied ? (
                      <>
                        <Check className="size-4" />
                        已应用
                      </>
                    ) : (
                      <>
                        <BookOpen className="size-4" />
                        应用到作品
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---- Trope Card Sub-component ----

function TropeCard({
  trope,
  compact = false,
}: {
  trope: GenreTrope;
  compact?: boolean;
}) {
  const popularity = POPULARITY_CONFIG[trope.popularity];
  const PopIcon = popularity.icon;

  if (compact) {
    return (
      <div className="rounded-md border p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{trope.name}</span>
          <span className={`flex items-center gap-0.5 text-xs ${popularity.color}`}>
            <PopIcon className="size-3" />
            {popularity.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{trope.description}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{trope.name}</span>
        <span
          className={`flex items-center gap-0.5 text-xs ${popularity.color}`}
        >
          <PopIcon className="size-3" />
          {popularity.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {trope.description}
      </p>
      {trope.examples.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {trope.examples.map((ex) => (
            <Badge key={ex} variant="secondary" className="text-xs">
              {ex}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
