import nochunk from './nochunk';

nochunk('test_2');

setTimeout(async () => {
  const fun = (await import('./chunk')).default;
  fun();
}, 1000)