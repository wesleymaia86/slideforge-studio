import type { BriefingInput } from "@slideforge/types";

/** Thin facade over AI pipeline — stub until providers are wired in infra. */
export class AiClient {
  async generateOutline(_input: BriefingInput, _dataContext?: string): Promise<unknown[]> {
    return [];
  }
}
