import { TestBed, getTestBed, ComponentFixture, TestModuleMetadata, TestBedStatic } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 * @hidden
 */
export const configureTestSuite = () => {

  let originReset: () => TestBedStatic;
  let originalConfigure: (moduleDef: TestModuleMetadata) => TestBedStatic;
  let configured = false;
  beforeAll(() => {
    originReset = TestBed.resetTestingModule;
    // TestBed.resetTestingModule();
    TestBed.resetTestingModule = () => TestBed;
    originalConfigure = TestBed.configureTestingModule;
    TestBed.configureTestingModule = (moduleDef) => {
      const testBedApi: any = getTestBed();
      // allow once configure (this beforeAll runs first) and skip consecutive calls
      if (!configured) {
        originalConfigure.call(testBedApi, moduleDef);
        configured = true;
        return testBedApi;
      }
      return { compileComponents: () => Promise.resolve() };
    };
    resizeObserverIgnoreError();
  });

  afterEach(() => {
    const testBedApi: any = getTestBed();
    testBedApi.destroyActiveFixtures();
  });

  afterAll(() => {
    configured = false;
    TestBed.resetTestingModule = originReset;
    TestBed.configureTestingModule = originalConfigure;
    TestBed.resetTestingModule();
  });
};
