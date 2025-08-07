// src/lib/model-map.ts
export const modelMap: Record<string, { provider: string; model: string }> = {
  'openai/gpt-4o-mini'      : { provider: 'openai',  model: 'gpt-4o' },
  'openai/gpt-4o'           : { provider: 'openai',  model: 'gpt-4o' },

  'anthropic/claude-3.5-sonnet' : {
    provider: 'anthropic',
    model   : 'claude-3-5-sonnet-latest',
  },

  'xai/grok-3-mini' : { provider: 'xai', model: 'grok-2-latest' },
  /* добавляйте сюда новые варианты по мере надобности */
}
