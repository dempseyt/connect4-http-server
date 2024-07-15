declare module expect {
  interface AsymmetricMatchers {
    toBeUuid(receive: string): void;
  }
  interface Matchers<R> {
    toBeUuid(received: string): R;
  }
}

export default expect;
