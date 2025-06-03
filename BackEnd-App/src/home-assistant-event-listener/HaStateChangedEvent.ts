export class HaStateChangedEvent {
    constructor(
      public readonly entityId: string,
      public readonly newState: any,
      public readonly oldState: any
    ) {}
}
  