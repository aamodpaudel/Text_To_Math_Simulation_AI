"use client";

import { Mafs, Coordinates, Plot, Theme, Circle, Line } from "mafs";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import "mafs/core.css";
import "mafs/font.css";

// Scope for react-live to access Mafs components
const scope = {
    Mafs,
    Coordinates,
    Plot,
    Theme,
    Circle,
    Line,
    Math,
};

// Default code if nothing provided
const defaultCode = `
<Mafs height={400}>
  <Coordinates.Cartesian />
  <Plot.OfX y={(x) => Math.sin(x)} color={Theme.blue} />
</Mafs>
`;

export default function Blackboard({ code }: { code?: string }) {
    const codeToRender = code && code.trim() ? code : defaultCode;

    return (
        <div className="w-full h-full bg-black rounded-lg border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full p-2 bg-slate-900 text-slate-300 text-xs font-mono border-b border-slate-800">
                Blackboard (Mafs)
            </div>
            <div className="flex-1 w-full relative overflow-auto">
                <LiveProvider code={codeToRender} scope={scope} noInline={false}>
                    <LiveError className="text-red-400 p-4 text-xs bg-red-900/40 border border-red-700 m-2 rounded overflow-auto font-mono max-h-32" />
                    <LivePreview className="w-full h-full flex items-center justify-center p-4" />
                </LiveProvider>
            </div>
        </div>
    );
}
