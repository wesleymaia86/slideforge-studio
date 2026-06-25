import { Global, Module } from "@nestjs/common";
import { AiClient } from "@slideforge/ai";
import { OpenRouterClientService } from "./openrouter-client.service";
import { AgentRouterService } from "./agent-router.service";

@Global()
@Module({
  providers: [
    OpenRouterClientService,
    AgentRouterService,
    {
      provide: AiClient,
      useFactory: (or: OpenRouterClientService, router: AgentRouterService) =>
        new AiClient({
          openRouter: or.getClient(),
          outlineModel: router.getModel(router.resolveOutlineProfile()),
        }),
      inject: [OpenRouterClientService, AgentRouterService],
    },
  ],
  exports: [AiClient, OpenRouterClientService, AgentRouterService],
})
export class AiModule {}
