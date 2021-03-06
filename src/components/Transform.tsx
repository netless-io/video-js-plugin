import React, { PropsWithChildren } from "react";

interface Props {
    size: { width: number; height: number };
    scale: number;
}

export function FlexTransform({ scale = 1, size, children }: PropsWithChildren<Props>) {
    return (
        <div
            style={{
                width: size.width / scale,
                height: size.height / scale,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                display: "flex",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
}
