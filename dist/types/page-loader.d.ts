import { NexusParser } from "./parser";
export interface NexusEvent {
    url: string;
    target: HTMLAnchorElement;
}
export interface NexusErrorEvent extends NexusEvent {
    message: string;
}
export interface NexusSwapEvent extends NexusEvent {
    rawData: string;
    parsedData: any;
}
export interface NexusEventMap {
    error: NexusErrorEvent;
    beforeLoad: NexusEvent;
    afterLoad: NexusEvent;
    beforeSwap: NexusSwapEvent;
    afterSwap: NexusSwapEvent;
    targetUrlValidation: NexusEvent;
}
export interface NexusConfig {
    contentRootSelector?: string;
    fetchConfig?: Partial<RequestInit>;
    excludeUrls?: RegExp;
    maxRetries?: number;
    retryTimeout?: number;
    vanillaPageLoadOnError?: boolean;
}
export declare class Nexus {
    private loading;
    private retryCount;
    private parser;
    private currentUrl;
    private currentTarget;
    private pushHistory;
    private config;
    private listeners;
    constructor(parser: NexusParser, config?: NexusConfig);
    on<K extends keyof NexusEventMap>(type: K, callback: (ev: NexusEventMap[K]) => Promise<any> | any): this;
    watch(): void;
    private dispatchError;
    private swapContent;
    private handleRawPageData;
    private handleLoadResult;
    private fetchPageContents;
    private loadPage;
    private dispatchEvent;
    private validateUrl;
    private interceptLinks;
    private watchPopstate;
    private onElementClick;
}
