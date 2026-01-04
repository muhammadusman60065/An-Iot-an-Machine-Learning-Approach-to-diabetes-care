import { cn } from "@/lib/utils";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { MLPrediction } from "@/hooks/useRealtimePatient";

interface MLPredictionPanelProps {
  prediction: MLPrediction | null;
}

const riskStyles = {
  low: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    progress: "bg-emerald-500",
  },
  medium: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    progress: "bg-yellow-500",
  },
  high: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    progress: "bg-orange-500",
  },
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    progress: "bg-red-500",
  },
};

export const MLPredictionPanel = ({ prediction }: MLPredictionPanelProps) => {
  // Loading state when ML is analyzing
  if (!prediction) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-1">AI Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Analyzing patient vitals with AI...
          </p>
          
          {/* Placeholder cards showing what will be displayed */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Analyzing...
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Anomaly Detection</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Analyzing...
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">AI Confidence</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Analyzing...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const styles = riskStyles[prediction.riskLevel];
  const confidencePercent = prediction.confidence;

  return (
    <div className={cn("rounded-xl border p-4", styles.bg, styles.border)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className={cn("w-5 h-5", styles.text)} />
        <h3 className="font-semibold">AI-Powered Analysis</h3>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Live</span>
        </div>
      </div>

      {/* Risk Level */}
      <div className={cn("rounded-lg p-4 mb-4", styles.bg)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Risk Level</span>
          <span className={cn("text-lg font-bold uppercase", styles.text)}>
            {prediction.riskLevel}
          </span>
        </div>
        <Progress 
          value={
            prediction.riskLevel === "low" ? 25 :
            prediction.riskLevel === "medium" ? 50 :
            prediction.riskLevel === "high" ? 75 : 100
          } 
          className="h-2"
        />
      </div>

      {/* AI Analysis Summary */}
      {prediction.analysis && (
        <div className="p-3 rounded-lg bg-muted/30 mb-3">
          <span className="text-xs text-muted-foreground block mb-1">AI Analysis</span>
          <span className="text-sm">{prediction.analysis}</span>
        </div>
      )}

      {/* Anomaly Status */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-3">
        <div className="flex items-center gap-2">
          {prediction.anomalyStatus ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          )}
          <span className="text-sm">Anomaly Status</span>
        </div>
        <span className={cn(
          "text-sm font-medium",
          prediction.anomalyStatus ? "text-red-400" : "text-emerald-400"
        )}>
          {prediction.anomalyStatus ? "Detected" : "Normal"}
        </span>
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm">AI Confidence</span>
        </div>
        <span className="text-sm font-medium">{confidencePercent.toFixed(1)}%</span>
      </div>

      {/* Predicted Condition */}
      {prediction.predictedCondition && (
        <div className="p-3 rounded-lg bg-muted/30 mb-3">
          <span className="text-xs text-muted-foreground block mb-1">Predicted Condition</span>
          <span className="text-sm font-medium">{prediction.predictedCondition}</span>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/30">
          <span className="text-xs text-muted-foreground block mb-2">Recommendations</span>
          <ul className="space-y-1">
            {prediction.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Last updated: {new Date(prediction.timestamp).toLocaleString()}
      </p>
    </div>
  );
};
