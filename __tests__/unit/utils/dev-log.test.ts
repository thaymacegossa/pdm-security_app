import { devLog } from '@utils/dev-log';

describe('devLog', () => {
  const originalDev = global.__DEV__;

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.__DEV__ = originalDev;
  });

  it('loga no console quando __DEV__ e true', () => {
    global.__DEV__ = true;

    devLog('teste', { ok: true });

    expect(console.info).toHaveBeenCalledWith('teste', { ok: true });
  });

  it('nao loga no console quando __DEV__ e false', () => {
    global.__DEV__ = false;

    devLog('teste');

    expect(console.info).not.toHaveBeenCalled();
  });
});
