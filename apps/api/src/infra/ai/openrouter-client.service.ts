import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenRouterClient } from "@slideforge/ai";

@Injectable()
export class OpenRouterClientService {
  constructor(private readonly config: ConfigService) {}

  getClient(): OpenRouterClient | null {
    const apiKey = this.config.get<string>("OPENROUTER_API_KEY");
    if (!apiKey?.trim()) return null;

    const webUrl = this.config.get<string>("WEB_URL");
    return new OpenRouterClient({
      apiKey,
      referer: webUrl,
      title: "SlideForge Studio",
    });
  }

  isEnabled(): boolean {
    return Boolean(this.getClient());
  }
}
