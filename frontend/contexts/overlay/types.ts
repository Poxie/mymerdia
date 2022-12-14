import { ReactElement } from "react";

export type Options = {
    onEscape?: () => void;
    onClose?: (previousPath?: string) => void;
    previousPath?: string;
}
export type Context = {
    setOverlay: (overlay: ReactElement, options?: Options) => void;
    hasOverlay: boolean;
    close: () => void;
}