import { Test, TestingModule } from '@nestjs/testing';
import { PandasApiController } from '../../src/pandas-api.controller';
import { PandasApiService } from '../../src/pandas-api.service';

describe('PandasApiController', () => {
  let pandasApiController: PandasApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PandasApiController],
      providers: [PandasApiService],
    }).compile();

    pandasApiController = app.get<PandasApiController>(PandasApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pandasApiController.getHello()).toBe('Hello World!');
    });
  });
});
