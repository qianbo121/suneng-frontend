import 'reflect-metadata';

import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ResolveWorkpieceRouterDto } from '@/modules/workpiece-router/dto/resolve-workpiece-router.dto';
import { WorkpieceRouterController } from '@/modules/workpiece-router/workpiece-router.controller';
import {
  WorkpieceRouterService,
  type WorkpieceRouterPublicResponse,
} from '@/modules/workpiece-router/workpiece-router.service';

describe('Batch 2.4A workpiece resolver HTTP entry', () => {
  it('exposes the public GET /api/workpiece-router/examples/:workpieceId route', () => {
    expect(Reflect.getMetadata(PATH_METADATA, WorkpieceRouterController.prototype.examples)).toBe(
      'examples/:workpieceId',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, WorkpieceRouterController.prototype.examples)).toBe(
      RequestMethod.GET,
    );
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, WorkpieceRouterController.prototype.examples)).toBe(
      true,
    );
  });

  it('exposes the public POST /api/workpiece-router/resolve route', () => {
    expect(Reflect.getMetadata(PATH_METADATA, WorkpieceRouterController)).toBe('workpiece-router');
    expect(Reflect.getMetadata(PATH_METADATA, WorkpieceRouterController.prototype.resolve)).toBe(
      'resolve',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, WorkpieceRouterController.prototype.resolve)).toBe(
      RequestMethod.POST,
    );
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, WorkpieceRouterController.prototype.resolve)).toBe(
      true,
    );
  });

  it('delegates only the validated public DTO to the service', () => {
    const response: WorkpieceRouterPublicResponse = {
      displayState: 'insufficient_conditions',
      conditionGroups: [],
      completedGroups: 0,
      totalGroups: 0,
      missingInputs: [],
      nextQuestion: null,
      publicDirections: [],
      customerNote: '待补充',
    };
    const service = {
      resolve: jest.fn().mockReturnValue(response),
    } as unknown as WorkpieceRouterService;
    const controller = new WorkpieceRouterController(service);
    const dto = {
      workpieceId: 'fixture-part',
      processPurposeId: 'anneal',
      rawConditions: {},
    } as ResolveWorkpieceRouterDto;
    expect(controller.resolve(dto)).toBe(response);
    expect(service.resolve).toHaveBeenCalledWith(dto);
  });

  it('delegates the selected workpiece to the read-only examples service', () => {
    const response = {
      workpieceId: 'large-forged-flange',
      examples: [{ condition: '正火', direction: '台车式周期炉' }],
      customerNote: '最终以工程确认为准。',
    };
    const service = {
      examples: jest.fn().mockReturnValue(response),
    } as unknown as WorkpieceRouterService;
    const controller = new WorkpieceRouterController(service);

    expect(controller.examples('large-forged-flange')).toBe(response);
    expect(service.examples).toHaveBeenCalledWith('large-forged-flange');
  });
});
