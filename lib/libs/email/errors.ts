export class EmailProcessingError extends Error {
  constructor(
    message: string,
    public readonly context: {
      id: string;
      actionType: string;
      emailType: string;
      [key: string]: any;
    },
  ) {
    super(message);
    this.name = "EmailProcessingError";
  }
}
