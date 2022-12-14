declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            NEXT_PUBLIC_API_ENDPOINT: string;
            NEXT_PUBLIC_WEBSITE_NAME: string;
            NEXT_PUBLIC_DEFAULT_LOCALE: string;
            NEXT_PUBLIC_WEBSITE_ORIGIN: string;
            NEXT_PUBLIC_BANNER_ENDPOINT: string;
            NEXT_PUBLIC_AVATAR_ENDPOINT: string;
            NEXT_PUBLIC_ATTACHMENT_ENDPOINT: string;
            NEXT_PUBLIC_WEBSOCKET_ENDPOINT: string;
            NEXT_PUBLIC_IMAGE_DOMAIN: string;
	}
    }
}

export {};
