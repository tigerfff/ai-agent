// 存储父项目注入的适配器
export const AdapterConfig = {
  http: null,
  configProvider: null
};

export function setAdapter(adapter) {
  if (!adapter.http) {
    console.warn('[AI-AA] http adapter is missing!');
  }
  if (!adapter.configProvider) {
    console.warn('[AI-AA] configProvider is missing!');
  }
  
  AdapterConfig.http = adapter.http;
  AdapterConfig.configProvider = adapter.configProvider;
}

export function getAdapter() {
  return AdapterConfig;
}

