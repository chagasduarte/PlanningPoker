import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hasUserGuard } from './has-user.guard';

describe('hasUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hasUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
