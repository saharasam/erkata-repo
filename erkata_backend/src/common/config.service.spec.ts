import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      systemConfig: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ key: 'test_key', value: 'test_value' }]),
        upsert: jest.fn().mockResolvedValue({ key: 'new', value: 'val' }),
      },
    };
    service = new ConfigService(prismaMock);
  });

  it('should load configs on init', async () => {
    await service.onModuleInit();
    expect(prismaMock.systemConfig.findMany).toHaveBeenCalled();
    expect(service.get('test_key')).toBe('test_value');
  });

  it('should return default value if key missing', () => {
    expect(service.get('missing', 'default')).toBe('default');
  });

  it('should update config and cache', async () => {
    await service.set('new_key', 123, 'desc');
    expect(prismaMock.systemConfig.upsert).toHaveBeenCalledWith({
      where: { key: 'new_key' },
      update: { value: 123, description: 'desc' },
      create: { key: 'new_key', value: 123, description: 'desc' },
    });
    expect(service.get('new_key')).toBe(123);
  });
});
