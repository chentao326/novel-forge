"use client";

import React, { useState } from "react";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

// ---- Types ----

type Severity = "error" | "warning" | "info";

interface ConsistencyResult {
  severity: Severity;
  description: string;
  affectedSettings: string[];
  suggestion: string;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  error: {
    label: "错误",
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  },
  warning: {
    label: "警告",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  },
  info: {
    label: "建议",
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  },
};

// ---- Main Component ----

export function ConsistencyPanel() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const projectSettings = useWorldStore((s) =>
    currentProjectId
      ? s.settings.filter((s) => s.project_id === currentProjectId)
      : []
  );

  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<ConsistencyResult[]>([]);
  const [rawOutput, setRawOutput] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const handleFullCheck = async () => {
    if (projectSettings.length === 0) return;
    setIsChecking(true);
    setResults([]);
    setRawOutput("");

    try {
      // Run consistency check for each setting against all others
      const allResults: ConsistencyResult[] = [];
      let fullOutput = "";

      for (const setting of projectSettings) {
        if (!setting.content) continue;

        const response = await fetch("/api/worldbuilding/check-consistency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settingId: setting.name,
            content: setting.content,
            projectId: currentProjectId,
          }),
        });

        if (!response.ok || !response.body) continue;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }

        fullOutput += `【${setting.name}】\n${result}\n\n`;

        // Parse the response to extract severity
        const hasConflict =
          result.includes("存在矛盾") ||
          result.includes("不一致") ||
          result.includes("冲突");

        if (hasConflict) {
          allResults.push({
            severity: "error",
            description: `${setting.name} 与其他设定存在矛盾`,
            affectedSettings: [setting.name],
            suggestion: result.includes("修改建议")
              ? result.split("修改建议")[1]?.trim().slice(0, 200) || "请检查并修正相关设定"
              : "请检查并修正相关设定",
          });
        } else if (result.includes("注意") || result.includes("建议")) {
          allResults.push({
            severity: "warning",
            description: `${setting.name} 存在需要注意的细节`,
            affectedSettings: [setting.name],
            suggestion: result.slice(0, 200),
          });
        }
      }

      // If no issues found, add a positive result
      if (allResults.length === 0) {
        allResults.push({
          severity: "info",
          description: "所有设定之间未发现明显矛盾",
          affectedSettings: [],
          suggestion: "建议定期检查，尤其是在添加新设定后。",
        });
      }

      setResults(allResults);
      setRawOutput(fullOutput);
      setHasChecked(true);
    } catch (error) {
      console.error("Consistency check error:", error);
      setResults([
        {
          severity: "error",
          description: "一致性检查过程中发生错误",
          affectedSettings: [],
          suggestion: "请稍后重试，或检查网络连接。",
        },
      ]);
    } finally {
      setIsChecking(false);
    }
  };

  const errorCount = results.filter((r) => r.severity === "error").length;
  const warningCount = results.filter((r) => r.severity === "warning").length;
  const infoCount = results.filter((r) => r.severity === "info").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-green-500" />
          <h3 className="text-lg font-semibold">一致性检查</h3>
        </div>
        <Button
          onClick={handleFullCheck}
          disabled={isChecking || projectSettings.length === 0}
        >
          {isChecking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {isChecking ? "检查中..." : "开始全面检查"}
        </Button>
      </div>

      {/* Stats */}
      {hasChecked && (
        <div className="flex gap-3">
          <Badge
            variant="destructive"
            className="flex items-center gap-1"
          >
            <AlertCircle className="size-3" />
            {errorCount} 错误
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          >
            <AlertTriangle className="size-3" />
            {warningCount} 警告
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <Info className="size-3" />
            {infoCount} 建议
          </Badge>
        </div>
      )}

      {/* No settings warning */}
      {projectSettings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldCheck className="mb-3 size-12 text-muted-foreground/30" />
          <h3 className="mb-1 text-lg font-medium">没有可检查的设定</h3>
          <p className="text-sm text-muted-foreground">
            请先在"设定管理"中创建一些世界观设定，然后再进行一致性检查
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-3">
            {results.map((result, index) => {
              const config = SEVERITY_CONFIG[result.severity];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${config.bgColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`size-5 shrink-0 mt-0.5 ${config.color}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={config.color}
                        >
                          {config.label}
                        </Badge>
                        {result.affectedSettings.length > 0 && (
                          <div className="flex gap-1">
                            {result.affectedSettings.map((name, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm">{result.description}</p>
                      {result.suggestion && (
                        <div className="rounded-md bg-background/50 p-2 text-xs text-muted-foreground">
                          <span className="font-medium">修复建议：</span>
                          {result.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Raw output toggle */}
            {rawOutput && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  查看完整检查报告
                </summary>
                <div className="mt-2 rounded-lg border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
                  {rawOutput}
                </div>
              </details>
            )}
          </div>
        </ScrollArea>
      )}

      {/* All clear */}
      {hasChecked && errorCount === 0 && warningCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="mb-3 size-12 text-green-500" />
          <h3 className="mb-1 text-lg font-medium text-green-700 dark:text-green-400">
            所有设定协调一致
          </h3>
          <p className="text-sm text-muted-foreground">
            未发现设定之间的矛盾或不一致之处
          </p>
        </div>
      )}
    </div>
  );
}
