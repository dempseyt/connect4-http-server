export type EventPublisher<P, R> = (queue: string, payload: P) => Promise<R>;
