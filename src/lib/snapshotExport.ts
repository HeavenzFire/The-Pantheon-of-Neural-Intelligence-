export interface ChronicleState {
  sessionId: string;
  activeCores: string[];
  resonanceIndex: number;
  dialogueHistory: Array<{ role: string; content: string; timestamp: number }>;
  customMetadata?: Record<string, any>;
}

export function exportChronicleSnapshot(state: ChronicleState): void {
  try {
    const payload = JSON.stringify(
      {
        ...state,
        exportedAt: new Date().toISOString(),
        version: "3.6-sovereign",
      },
      null,
      2
    );

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    
    anchor.href = url;
    anchor.download = `chronicle_snapshot_${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export chronicle snapshot:", error);
  }
}
