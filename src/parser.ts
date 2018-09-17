export interface Attribute {
    name: string;
    value: string;
}

export interface NexusParsedData {
    content: string;
    title?: string;
    htmlAttributes?: Attribute[];
    bodyAttributes?: Attribute[];
    contentRootAttributes?: Attribute[];
}

export class NexusParseError extends Error {}

export abstract class NexusParser {
    public abstract parse(rawData: string): NexusParsedData;
}
