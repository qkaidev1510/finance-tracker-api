import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /', () => {
    it('returns { status: "OK" }', () => {
      expect(controller.getRoot()).toEqual({ status: 'OK' });
    });
  });

  describe('HEAD /', () => {
    it('is callable and returns undefined', () => {
      expect(controller.root()).toBeUndefined();
    });
  });

  describe('GET /health', () => {
    it('returns { status: "OK" }', () => {
      expect(controller.getCheck()).toEqual({ status: 'OK' });
    });
  });

  describe('HEAD /health', () => {
    it('is callable and returns undefined', () => {
      expect(controller.healCheck()).toBeUndefined();
    });
  });
});
