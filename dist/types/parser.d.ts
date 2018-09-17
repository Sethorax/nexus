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
export declare class NexusParseError extends Error {
}
export declare abstract class NexusParser {
    abstract parse(rawData: string): NexusParsedData;
}
