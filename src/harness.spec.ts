/**
 * Step 1 smoke test — proves the Karma + Jasmine + headless Chrome harness runs.
 * Safe to delete once real specs exist (Step 4 covers Auth / interceptors).
 */
describe('test harness', () => {
  it('executes specs in the browser', () => {
    expect(1 + 1).toBe(2);
  });
});
