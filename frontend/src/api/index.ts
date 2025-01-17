import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import VueHook from 'alova/vue';

const alovaInstance = createAlova({
  baseURL: 'http://localhost:3000',
  requestAdapter: adapterFetch(),
  responded: response => response.json(),
  statesHook: VueHook

});