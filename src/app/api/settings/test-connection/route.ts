import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { success: false, message: "缺少 provider 或 apiKey 参数", latency: 0 },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    let baseUrl: string;
    let model: string;
    let headers: Record<string, string>;

    switch (provider) {
      case "deepseek":
        baseUrl = "https://api.deepseek.com/v1";
        model = "deepseek-chat";
        headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };
        break;
      case "qwen":
        baseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";
        model = "qwen-turbo";
        headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };
        break;
      case "openai":
        baseUrl = "https://api.openai.com/v1";
        model = "gpt-4o-mini";
        headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };
        break;
      case "anthropic":
        // Anthropic uses a different API format
        try {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-20250414",
              max_tokens: 10,
              messages: [{ role: "user", content: "你好" }],
            }),
          });

          const latency = Date.now() - startTime;

          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: "连接成功",
              latency,
            });
          }

          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            message: errorData?.error?.message || `HTTP ${response.status}`,
            latency,
          });
        } catch (error) {
          const latency = Date.now() - startTime;
          return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "连接失败",
            latency,
          });
        }
      default:
        return NextResponse.json(
          { success: false, message: "不支持的 provider", latency: 0 },
          { status: 400 }
        );
    }

    // OpenAI-compatible API call
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: "user", content: "你好" }],
      }),
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "连接成功",
        latency,
      });
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData?.error?.message || `HTTP ${response.status}`;

    return NextResponse.json({
      success: false,
      message: errorMessage,
      latency,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "服务器错误",
      latency: 0,
    });
  }
}
