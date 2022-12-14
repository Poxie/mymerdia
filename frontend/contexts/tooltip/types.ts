import { ReactElement, RefObject } from "react";

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export type Context = {
    setTooltip: (options: {
        tooltip: ReactElement | string;
        position?: TooltipPosition;
    }, ref: RefObject<HTMLDivElement>) => void;
    close: () => void;
}