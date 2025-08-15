import { atom, selector } from 'recoil';
import { EModelEndpoint } from 'librechat-data-provider';
import type { TEndpointsConfig } from 'librechat-data-provider';

const defaultConfig: TEndpointsConfig = {
  [EModelEndpoint.azureOpenAI]: null,
  [EModelEndpoint.azureAssistants]: null,
  [EModelEndpoint.assistants]: null,
  [EModelEndpoint.agents]: null,
  [EModelEndpoint.openAI]: null,
  [EModelEndpoint.chatGPTBrowser]: null,
  [EModelEndpoint.gptPlugins]: null,
  [EModelEndpoint.google]: null,
  [EModelEndpoint.anthropic]: null,
  [EModelEndpoint.custom]: null,
};

const endpointsConfig = atom<TEndpointsConfig>({
  key: 'endpointsConfig',
  default: defaultConfig,
});

const endpointsQueryEnabled = atom<boolean>({
  key: 'endpointsQueryEnabled',
  default: true,
});

const plugins = selector<Record<string, unknown>>({
  key: 'plugins',
  get: ({ get }) => {
    const config = (get(endpointsConfig) || {}) as TEndpointsConfig & {
      gptPlugins?: { plugins?: Record<string, unknown> };
    };
    return config.gptPlugins?.plugins || {};
  },
});

const endpointsFilter = selector<Record<string, boolean>>({
  key: 'endpointsFilter',
  get: ({ get }) => {
    const config = (get(endpointsConfig) || {}) as Record<string, unknown>;

    const filter: Record<string, boolean> = {};
    for (const key of Object.keys(config)) {
      filter[key] = Boolean((config as Record<string, unknown>)[key]);
    }
    return filter;
  },
});

export default {
  plugins,
  endpointsConfig,
  endpointsFilter,
  defaultConfig,
  endpointsQueryEnabled,
};
