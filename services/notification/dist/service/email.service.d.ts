export declare class EmailService {
    private readonly options;
    private readonly logger;
    private readonly sesClient;
    private readonly emailFrom;
    constructor(options: any);
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}
