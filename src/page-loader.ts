import { getEventPath, elementMatches } from "@sethorax/browser-utils";
import { NexusParser, NexusParsedData } from "./parser";

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

interface NexusEventListener {
    type: keyof NexusEventMap;
    callback: (
        ev: NexusEventMap[keyof NexusEventMap]
    ) => Promise<any> | void | boolean;
}

type NexusEventListenerCollection = {
    [key in keyof NexusEventMap]: NexusEventListener[]
};

export class Nexus {
    private loading = false;
    private retryCount = 0;
    private parser: NexusParser = null;
    private currentUrl: string;
    private currentTarget: HTMLAnchorElement;
    private pushHistory: boolean = true;
    private config: NexusConfig = {
        contentRootSelector: "body",
        excludeUrls: new RegExp(".([a-z]+)$", "gm"),
        maxRetries: 3,
        retryTimeout: 500,
        vanillaPageLoadOnError: true,
    };
    private listeners: NexusEventListenerCollection = {
        error: [],
        beforeLoad: [],
        afterLoad: [],
        beforeSwap: [],
        afterSwap: [],
        targetUrlValidation: [],
    };

    public constructor(parser: NexusParser, config: NexusConfig = {}) {
        this.parser = parser;
        this.config = {
            ...this.config,
            ...config,
        };
    }

    public on<K extends keyof NexusEventMap>(
        type: K,
        callback: (ev: NexusEventMap[K]) => Promise<any> | any
    ) {
        this.listeners[type].push({ type, callback });

        return this;
    }

    public watch() {
        try {
            this.interceptLinks();
            this.watchPopstate();
        } catch (e) {
            this.dispatchError(e);
        }
    }

    private dispatchError(message: string) {
        this.dispatchEvent("error", {
            url: this.currentUrl,
            target: this.currentTarget,
            message,
        });

        if (this.config.vanillaPageLoadOnError && this.currentTarget) {
            location.href = this.currentUrl;
        }
    }

    private swapContent(rawData: string, parsedData: NexusParsedData) {
        const {
            title,
            content,
            contentRootAttributes,
            htmlAttributes,
            bodyAttributes,
        } = parsedData;
        const contentRoot = document.querySelector(
            this.config.contentRootSelector
        );

        if (!contentRoot) {
            throw Error("ContentRoot does not exist!");
        }

        contentRoot.innerHTML = content;

        if (title) {
            document.title = title;
        }

        if (contentRootAttributes) {
            contentRootAttributes.forEach(a =>
                contentRoot.setAttribute(a.name, a.value)
            );
        }

        if (bodyAttributes) {
            bodyAttributes.forEach(a =>
                document.body.setAttribute(a.name, a.value)
            );
        }

        if (htmlAttributes) {
            htmlAttributes.forEach(a =>
                document.documentElement.setAttribute(a.name, a.value)
            );
        }

        if (this.pushHistory) {
            history.pushState({}, title, this.currentUrl);
        }

        this.dispatchEvent("afterSwap", {
            url: this.currentUrl,
            target: this.currentTarget,
            parsedData,
            rawData,
        });

        this.loading = false;
    }

    private handleRawPageData(data: string) {
        const parsedData = this.parser.parse(data);

        this.dispatchEvent("beforeSwap", {
            url: this.currentUrl,
            target: this.currentTarget,
            rawData: data,
            parsedData,
        });

        this.swapContent(data, parsedData);
    }

    private fetchPageContents(url: string) {
        const controller = new AbortController();
        const { signal } = controller;

        const retry = () => {
            this.retryCount++;

            console.warn(
                `Could not fetch page! Retrying (${this.retryCount}/${
                    this.config.maxRetries
                }) ...`
            );

            controller.abort();
            setTimeout(
                () => this.fetchPageContents(url),
                this.config.retryTimeout
            );
        };

        fetch(url, {
            ...this.config.fetchConfig,
            signal,
        })
            .then(res => {
                if (res.status >= 400) {
                    throw new Error();
                }

                return res.text();
            })
            .then(res => {
                this.dispatchEvent("afterLoad", {
                    url,
                    target: this.currentTarget,
                });

                try {
                    this.handleRawPageData(res);
                } catch (e) {
                    this.dispatchError(e);
                }
            })
            .catch(() => {
                if (this.retryCount < this.config.maxRetries) {
                    retry();
                } else {
                    this.dispatchError(
                        "Could not fetch page! Max retries exceeded!"
                    );
                }
            });
    }

    private loadPage(url: string, target: HTMLAnchorElement) {
        if (this.loading) return;

        this.loading = true;

        this.currentTarget = target;
        this.currentUrl = url;

        this.dispatchEvent("beforeLoad", { url, target });

        this.fetchPageContents(url);
    }

    private dispatchEvent<K extends keyof NexusEventMap>(
        type: K,
        ev: NexusEventMap[K]
    ) {
        return Promise.all(
            this.listeners[type].map(l => Promise.resolve(l.callback(ev)))
        );
    }

    private validateUrl(url: string, target: HTMLAnchorElement) {
        return (
            target.target !== "blank" &&
            this.config.excludeUrls.exec(url) === null &&
            url.indexOf(location.origin) > -1 &&
            this.listeners["targetUrlValidation"].every(
                l => l.callback({ url, target }) !== false
            )
        );
    }

    private async interceptLinks() {
        this.onElementClick("a", async (event, target) => {
            const url = target.href;

            if (this.validateUrl(url, target)) {
                event.preventDefault();

                if (url !== location.href) {
                    this.pushHistory = true;
                    this.loadPage(url, target);
                }
            }
        });
    }

    private watchPopstate() {
        window.onpopstate = () => {
            this.currentUrl = location.href;
            this.currentTarget = null;
            this.pushHistory = false;

            this.loadPage(location.href, null);
        };
    }

    private onElementClick(
        selector: string,
        callback: (event: Event, target: HTMLAnchorElement) => void
    ) {
        document.addEventListener("click", event => {
            const path = getEventPath(event);

            const target = path.find((e: HTMLElement) =>
                elementMatches(e, selector)
            );

            if (target) {
                callback(event, target as HTMLAnchorElement);
            }
        });
    }
}
