declare module '@met4citizen/talkinghead' {
    export class TalkingHead {
        constructor(node: HTMLElement | null, options?: any);
        showAvatar(options: any): Promise<void>;
        speakText(text: string): Promise<void>;
        // Add other methods as needed based on usage
    }
}
