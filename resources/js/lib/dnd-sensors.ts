import {
    KeyboardSensor as LibKeyboardSensor,
    MouseSensor as LibMouseSensor,
    PointerSensor as LibPointerSensor,
    TouchSensor as LibTouchSensor,
} from "@dnd-kit/core";
import { MouseEvent, SyntheticEvent, TouchEvent } from "react";

// https://github.com/clauderic/dnd-kit/issues/477#issuecomment-1713536492

export function isInNoDndZone(event: MouseEvent | TouchEvent | SyntheticEvent) {
    let cur: HTMLElement | null = (event.target as HTMLElement) || null;

    while (cur) {
        if (cur.dataset && cur.dataset.noDnd) {
            return true;
        }
        cur = cur.parentElement as HTMLElement | null;
    }

    return false;
}

// Block DnD event propagation if element have "data-no-dnd" attribute
const handler = ({ nativeEvent: event }: MouseEvent | TouchEvent) => {
    return !isInNoDndZone({ target: event.target } as any);
};

export class MouseSensor extends LibMouseSensor {
    static activators = [
        { eventName: "onMouseDown", handler },
    ] as (typeof LibMouseSensor)["activators"];
}

export class PointerSensor extends LibPointerSensor {
    static activators = [
        { eventName: "onPointerDown", handler },
    ] as (typeof LibPointerSensor)["activators"];
}

export class TouchSensor extends LibTouchSensor {
    static activators = [
        { eventName: "onTouchStart", handler },
    ] as (typeof LibTouchSensor)["activators"];
}

export class KeyboardSensor extends LibKeyboardSensor {
    static activators = [
        { eventName: "onKeyDown", handler },
    ] as (typeof LibKeyboardSensor)["activators"];
}
